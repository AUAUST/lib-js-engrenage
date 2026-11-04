import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join as joinPath } from "node:path";

import {
  createSourceFile,
  flattenDiagnosticMessageText,
  isCallSignatureDeclaration,
  isComputedPropertyName,
  isConstructSignatureDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isModuleBlock,
  isModuleDeclaration,
  isNumericLiteral,
  isPropertyAccessExpression,
  isStringLiteral,
  isVariableStatement,
  ScriptTarget,
  type Node,
  type PropertyName,
  type Statement,
} from "typescript";
import {
  literal,
  looseObject,
  object,
  optional,
  parse,
  string,
  union,
  unknown,
  record as vrecord,
} from "valibot";

import { join, map, sort } from "@auaust/primitive-kit/arrays";
import { entries, record, values } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { resolve } from "#foundation/filesystem/utils/resolve";
import { listEsSelections } from "#project/baseline/operations/listEsSelections";
import {
  esInterfaceAliases,
  esMemberCompatKeys,
} from "#tools/typescript/constants";
import { createLibraryCompiler } from "#tools/typescript/operations/createLibraryCompiler";
import { formatModule } from "#tools/typescript/operations/formatModule";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const editionsFile: File = "src/project/baseline/editions/constants.ts";

const editionFilePattern = /^lib\.(es20\d\d)\.d\.ts$/;

const editionPattern = /^es20\d\d$/;

const typedArrayPattern =
  /^(?:Big)?(?:Float|Int|Uint)(?:8|16|32|64)(?:Clamped)?Array$/;

const intlOptionsPattern = /^Intl\.(?:Resolved)?(\w+)Options$/;

const constructorSuffix = /Constructor$/;

const compatSchema = object({
  features: vrecord(
    string(),
    looseObject({
      kind: string(),
      discouraged: optional(unknown()),
      status: optional(
        looseObject({
          by_compat_key: optional(
            vrecord(
              string(),
              looseObject({
                baseline: union([literal(false), string()]),
                baseline_low_date: optional(string()),
              }),
            ),
          ),
        }),
      ),
    }),
  ),
});

const versionSchema = looseObject({
  version: string(),
});

type Declaration =
  | { type: "member"; owner: string; name: string }
  | { type: "signature"; owner: string }
  | { type: "value"; name: string };

interface Library {
  name: string;
  references: readonly string[];
  declarations: readonly Declaration[];
  interfaces: ReadonlySet<string>;
  values: ReadonlySet<string>;
}

interface Compat {
  date: string | null;
  discouraged: boolean;
}

function mergeDates(
  dates: readonly Maybe<string>[],
): Maybe<string> | undefined {
  if (dates.includes(null)) {
    return null;
  }

  return dates.length === 0 ? undefined : sort([...dates] as string[]).at(-1);
}

function readVersion(directory: Directory): string {
  return parse(
    versionSchema,
    JSON.parse(readFileSync(joinPath(directory, "package.json"), "utf-8")),
  ).version;
}

function readCompat(featuresFile: File): Map<string, Compat> {
  const { features } = parse(
    compatSchema,
    JSON.parse(readFileSync(featuresFile, "utf-8")),
  );

  const compat = new Map<string, Compat>();

  for (const feature of values(features)) {
    if (feature.kind !== "feature") {
      continue;
    }

    for (const [key, status] of entries(feature.status?.by_compat_key ?? {})) {
      const date =
        status.baseline === false || status.baseline_low_date == null
          ? null
          : status.baseline_low_date.replace("≤", "");

      const discouraged = feature.discouraged != null;
      const known = compat.get(key);

      compat.set(
        key,
        known === undefined
          ? { date, discouraged }
          : {
              date: mergeDates([known.date, date]) ?? null,
              discouraged: known.discouraged && discouraged,
            },
      );
    }
  }

  return compat;
}

function readMemberName(name: PropertyName | undefined): string | undefined {
  if (name == null) {
    return;
  }

  if (isIdentifier(name) || isStringLiteral(name)) {
    return name.text;
  }

  if (
    isComputedPropertyName(name) &&
    isPropertyAccessExpression(name.expression) &&
    isIdentifier(name.expression.expression) &&
    name.expression.expression.text === "Symbol"
  ) {
    return `@@${name.expression.name.text}`;
  }
}

function collectDeclarations(
  statements: readonly Statement[],
  prefix: string,
  library: {
    declarations: Declaration[];
    interfaces: Set<string>;
    values: Set<string>;
  },
  library_: string,
) {
  for (const statement of statements) {
    if (isInterfaceDeclaration(statement)) {
      const owner = `${prefix}${statement.name.text}`;

      library.interfaces.add(owner);

      for (const member of statement.members) {
        if (
          isCallSignatureDeclaration(member) ||
          isConstructSignatureDeclaration(member)
        ) {
          library.declarations.push({ type: "signature", owner });

          continue;
        }

        if (member.name == null || isNumericLiteral(member.name)) {
          continue;
        }

        const name = readMemberName(member.name);

        if (name === undefined) {
          throw new Error(
            `lib.${library_}.d.ts declares ${owner} with a member name that is neither an identifier nor [Symbol.<name>]`,
          );
        }

        library.declarations.push({
          type: "member",
          owner,
          name,
        });
      }
    } else if (isVariableStatement(statement)) {
      for (const { name } of statement.declarationList.declarations) {
        if (!isIdentifier(name)) {
          continue;
        }

        library.values.add(`${prefix}${name.text}`);

        library.declarations.push({
          type: "value",
          name: `${prefix}${name.text}`,
        });
      }
    } else if (isFunctionDeclaration(statement) && statement.name != null) {
      library.values.add(`${prefix}${statement.name.text}`);

      library.declarations.push({
        type: "value",
        name: `${prefix}${statement.name.text}`,
      });
    } else if (isModuleDeclaration(statement) && statement.body != null) {
      const name = isIdentifier(statement.name) ? statement.name.text : "";
      const inner = name === "global" ? prefix : `${prefix}${name}.`;
      const body: Node = statement.body;

      collectDeclarations(
        isModuleBlock(body)
          ? body.statements
          : isModuleDeclaration(body)
            ? [body]
            : [],
        inner,
        library,
        library_,
      );
    }
  }
}

function parseLibrary(directory: Directory, name: string): Library {
  const source = createSourceFile(
    `lib.${name}.d.ts`,
    readFileSync(joinPath(directory, `lib.${name}.d.ts`), "utf-8"),
    ScriptTarget.ESNext,
    true,
  );

  const library = {
    declarations: [] as Declaration[],
    interfaces: new Set<string>(),
    values: new Set<string>(),
  };

  collectDeclarations(source.statements, "", library, name);

  return {
    name,
    references: map(source.libReferenceDirectives, ({ fileName }) => fileName),
    ...library,
  };
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

function listCandidates(declaration: Declaration, isFirst: boolean): string[] {
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

function describeDeclaration(declaration: Declaration): string {
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

// @debt generateEditions parses, matches, resolves and formats in one function; those stages could be separate modules, and collectDeclarations carries a `library_` name next to `library` for two different things.
export async function generateEditions(
  config: ProjectConfig,
  {
    libraries = readDefaultLibraries(),
    features = readDefaultFeatures(),
  }: { libraries?: Directory; features?: File } = {},
) {
  const compat = readCompat(features);
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

  const editionNames = sort(
    readdirSync(libraries).flatMap((file) => {
      return editionFilePattern.exec(file)?.[1] ?? [];
    }),
  );

  const editionLibraries = new Map<string, string[]>();

  for (const [position, edition] of editionNames.entries()) {
    const previous = editionNames[position - 1] ?? "es5";

    editionLibraries.set(
      edition,
      parseLibrary(libraries, edition).references.filter((name) => {
        return name !== previous;
      }),
    );
  }

  const order = ["es5", ...[...editionLibraries.values()].flat()];

  const parsed = new Map(
    map(order, (name) => {
      return [name, parseLibrary(libraries, name)] as const;
    }),
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
          `lib.${name}.d.ts declares ${describeDeclaration(declaration)}, which matches no web-features compat key: add it to esMemberCompatKeys or esInterfaceAliases in src/tools/typescript/constants.ts`,
        );
      }
    }

    if (dates.length === 0) {
      failures.push(`lib.${name}.d.ts ends with no counted declaration`);
    }

    own.set(name, mergeDates(dates) ?? null);
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
        ? mergeDates(
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

    const date = mergeDates(dates);

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
    `// Generated by \`pnpm support codegen editions\` from TypeScript ${readVersion(dirname(libraries))} and web-features ${readVersion(dirname(features))}. Do not edit.`,
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

  config.filesystem.write(
    editionsFile,
    await formatModule(resolve(config.root, editionsFile), content),
  );
}
