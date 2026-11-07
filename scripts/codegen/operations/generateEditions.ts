import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join as joinPath } from "node:path";

import { flattenDiagnosticMessageText } from "typescript";
import { looseObject, parse, string } from "valibot";

import { join, map, sort } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { resolve } from "#foundation/filesystem/utils/resolve";
import { listEsSelections } from "#project/baseline/utils/listEsSelections";
import {
  esInterfaceAliases,
  esMemberCompatKeys,
} from "#scripts/codegen/constants";
import { parseEditionLibrary } from "#scripts/codegen/operations/parseEditionLibrary";
import { readEditionCompat } from "#scripts/codegen/operations/readEditionCompat";
import { mergeCompatDates } from "#scripts/codegen/utils/mergeCompatDates";
import { createLibraryCompiler } from "#tools/typescript/operations/createLibraryCompiler";
import { formatModule } from "#tools/typescript/operations/formatModule";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { LibraryDeclaration } from "#scripts/codegen/types/LibraryDeclaration";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const editionsFile: File = "src/project/baseline/editions/constants.ts";

const editionFilePattern = /^lib\.(es20\d\d)\.d\.ts$/;

const editionPattern = /^es20\d\d$/;

const typedArrayPattern =
  /^(?:Big)?(?:Float|Int|Uint)(?:8|16|32|64)(?:Clamped)?Array$/;

const intlOptionsPattern = /^Intl\.(?:Resolved)?(\w+)Options$/;

const constructorSuffix = /Constructor$/;

const versionSchema = looseObject({
  version: string(),
});

async function readVersion(directory: Directory): Promise<string> {
  return parse(
    versionSchema,
    JSON.parse(await readFile(joinPath(directory, "package.json"), "utf-8")),
  ).version;
}

function splitName(name: string): { prefix: string; base: string } {
  const split = name.lastIndexOf(".") + 1;

  return { prefix: name.slice(0, split), base: name.slice(split) };
}

function toRuntimeName(owner: string): string {
  const { prefix, base } = splitName(owner);

  const alias = (esInterfaceAliases as Record<string, string | undefined>)[
    base
  ];

  return `${prefix}${alias ?? base.replace(constructorSuffix, "")}`;
}

function listCandidates(
  declaration: LibraryDeclaration,
  isFirst: boolean,
): string[] {
  if (declaration.type === "value") {
    return [`javascript.builtins.${declaration.name}`];
  }

  const { owner } = declaration;
  const { prefix, base } = splitName(owner);
  const runtime = splitName(toRuntimeName(owner)).base;

  if (declaration.type === "signature") {
    return base.endsWith("Constructor")
      ? [`javascript.builtins.${prefix}${runtime}.${runtime}`]
      : [];
  }

  const table = (esMemberCompatKeys as Record<string, string | undefined>)[
    `${owner}.${declaration.name}`
  ];

  if (table !== undefined) {
    return [table];
  }

  const intl = intlOptionsPattern.exec(owner)?.[1];

  return [
    `javascript.builtins.${prefix}${runtime}.${declaration.name}`,
    ...(typedArrayPattern.test(runtime)
      ? [`javascript.builtins.TypedArray.${declaration.name}`]
      : []),
    ...(intl === undefined
      ? []
      : [
          `javascript.builtins.Intl.${intl}.${intl}.options_parameter.options_${declaration.name}_parameter`,
        ]),
    ...(isFirst ? [`javascript.builtins.${prefix}${runtime}`] : []),
  ];
}

function describeDeclaration(declaration: LibraryDeclaration): string {
  switch (declaration.type) {
    case "member": {
      return `${declaration.owner}.${declaration.name}`;
    }
    case "signature": {
      return `a signature of ${declaration.owner}`;
    }
    case "value": {
      return declaration.name;
    }
  }
}

function readDefaultLibraries(): Directory {
  return dirname(
    createRequire(import.meta.url).resolve("typescript/lib/lib.es5.d.ts"),
  );
}

function readDefaultFeatures(): File {
  return createRequire(import.meta.url).resolve("web-features/data.json");
}

// @debt generateEditions matches, resolves and formats in one function; those stages could be separate modules.
export async function generateEditions(
  config: LoadedConfig,
  {
    libraries = readDefaultLibraries(),
    features = readDefaultFeatures(),
  }: { libraries?: Directory; features?: File } = {},
) {
  const compat = await readEditionCompat(features);

  const failures: string[] = [];

  for (const [name, key] of entries({
    ...esMemberCompatKeys,
  })) {
    if (!compat.has(key)) {
      failures.push(
        `esMemberCompatKeys["${name}"] names ${key}, which web-features does not know`,
      );
    }
  }

  const files = await readdir(libraries);

  const editionNames = sort(
    files.flatMap((file) => {
      return editionFilePattern.exec(file)?.[1] ?? [];
    }),
  );

  const editionLibraries = new Map<string, string[]>();

  for (const [position, edition] of editionNames.entries()) {
    const previous = editionNames[position - 1] ?? "es5";

    const { references } = await parseEditionLibrary(libraries, edition);

    editionLibraries.set(
      edition,
      references.filter((name) => name !== previous),
    );
  }

  const order = ["es5", ...[...editionLibraries.values()].flat()];

  const parsed = new Map(
    await Promise.all(
      map(order, async (name) => {
        return [name, await parseEditionLibrary(libraries, name)] as const;
      }),
    ),
  );

  const runtimeValues = new Set(
    [...parsed.values()].flatMap((library) => {
      return [...library.values];
    }),
  );

  const own = new Map<string, Maybe<string>>();

  for (const [position, name] of order.entries()) {
    if (name === "es5") {
      continue;
    }

    const library = parsed.get(name);

    if (library === undefined) {
      continue;
    }

    const earlier = new Set(
      order.slice(0, position).flatMap((library_) => {
        return [...(parsed.get(library_)?.interfaces ?? [])];
      }),
    );

    const dates: Maybe<string>[] = [];

    for (const declaration of library.declarations) {
      const isFirst =
        declaration.type !== "value" && !earlier.has(declaration.owner);

      const known = listCandidates(declaration, isFirst)
        .map((key) => compat.get(key))
        .find((entry) => entry !== undefined);

      if (known !== undefined) {
        if (!known.discouraged) {
          dates.push(known.date);
        }

        continue;
      }

      const isTypeOnly =
        declaration.type !== "value" &&
        isFirst &&
        !runtimeValues.has(toRuntimeName(declaration.owner));

      if (!isTypeOnly) {
        failures.push(
          `lib.${name}.d.ts declares ${describeDeclaration(declaration)}, which matches no web-features compat key: add it to esMemberCompatKeys or esInterfaceAliases in scripts/codegen/constants.ts`,
        );
      }
    }

    if (dates.length === 0) {
      failures.push(`lib.${name}.d.ts ends with no counted declaration`);
    }

    own.set(name, mergeCompatDates(dates) ?? null);
  }

  if (failures.length > 0) {
    throw new Error(join([...new Set(failures)], "\n"));
  }

  const resolved = new Map<string, Maybe<string> | undefined>();

  function resolveLibrary(name: string): Maybe<string> | undefined {
    if (resolved.has(name)) {
      return resolved.get(name);
    }

    const library = parsed.get(name);

    if (library === undefined) {
      return;
    }

    resolved.set(name, undefined);

    const dates: Maybe<string>[] = [own.get(name) ?? null];

    for (const reference of library.references) {
      const date = editionPattern.test(reference)
        ? mergeCompatDates(
            editionNames
              .filter((edition) => edition <= reference)
              .flatMap((edition) => {
                return editionLibraries.get(edition) ?? [];
              })
              .map((library_) => {
                return resolveLibrary(library_) ?? null;
              }),
          )
        : resolveLibrary(reference);

      if (date !== undefined) {
        dates.push(date);
      }
    }

    const date = mergeCompatDates(dates);

    resolved.set(name, date);

    return date;
  }

  function listLibraries(edition: string): string[] {
    return editionLibraries.get(edition) ?? [];
  }

  const data = record(
    map(editionNames, (edition) => {
      return [
        edition,
        record(
          map(listLibraries(edition), (name) => {
            return [name, resolveLibrary(name) ?? null] as const;
          }),
        ),
      ] as const;
    }),
  );

  const { compile } = createLibraryCompiler(libraries);

  for (const { from, lib } of listEsSelections(data)) {
    const diagnostic = compile({
      lib,
      // @debt the base edition, first in every selection, is trusted as TypeScript ships it so only the libs added on top are type-checked; this holds only while TypeScript keeps each edition consistent on its own.
      trusted: lib.slice(0, 1),
      sources: new Map([["index.d.ts", ""]]),
      entry: "index.d.ts",
    });

    if (diagnostic !== undefined) {
      throw new Error(
        `The ES libs selected from ${from} (${join(lib, ", ")}) do not compile: ${flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`,
      );
    }
  }

  const content = [
    `// Generated by \`pnpm support codegen editions\` from TypeScript ${await readVersion(dirname(libraries))} and web-features ${await readVersion(dirname(features))}. Do not edit.`,
    "",
    `export const editions = {\n${join(
      map(
        entries(data),
        ([edition, libraries]) => `${edition}: ${JSON.stringify(libraries)},`,
      ),
      "\n",
    )}\n} as const;`,
    "",
  ].join("\n");

  const filesystem = config.context.filesystem;

  await filesystem.write(
    editionsFile,
    await formatModule(resolve(config.context.root, editionsFile), content),
  );
}
