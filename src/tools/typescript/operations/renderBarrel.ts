import { basename, extname } from "node:path";

import {
  array,
  boolean,
  exactOptional,
  pipe,
  readonly,
  strictObject,
  string,
} from "valibot";

import { toSorted } from "@auaust/primitive-kit/arrays";

import { validate } from "#foundation/options/index";
import { barrelHeader, identifierPattern } from "#tools/typescript/constants";
import { compareNaturally } from "#tools/typescript/utils/compareNaturally";
import { resolveImportSpecifier } from "#tools/typescript/utils/resolveImportSpecifier";
import type { LoadedConfig } from "#project/config/index";
import type { SubpathImports } from "#project/package/index";
import type { BarrelExportsResolver } from "#tools/typescript/ports/BarrelExportsResolver";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { File } from "#types/File";

const defaultBinding = "default";

const barrelExportsSchema = pipe(
  array(
    strictObject({
      file: string(),
      binding: exactOptional(string()),
      name: exactOptional(string()),
      typeOnly: exactOptional(boolean()),
    }),
  ),
  readonly(),
);

interface NameClaim {
  readonly name: string;
  readonly file: File;
}

function exportModule({ file, contract }: BarrelModule): BarrelExport[] {
  if (contract.typeOnly) {
    return [{ file, typeOnly: true }];
  }

  const name = basename(file, extname(file));
  const { values, types } = contract.exports;
  const listed: BarrelExport[] = [];

  switch (values) {
    case "default": {
      listed.push({
        file,
        binding: defaultBinding,
        name,
      });

      break;
    }

    case "named-match": {
      listed.push({ file, binding: name });

      break;
    }

    case "none": {
      break;
    }

    case "named":
    case undefined: {
      return [{ file }];
    }
  }

  switch (types) {
    case "named-match": {
      if (values !== "named-match") {
        listed.push({
          file,
          binding: name,
          typeOnly: true,
        });
      }

      break;
    }

    case "none": {
      break;
    }

    case "named":
    case undefined: {
      listed.push({ file, typeOnly: true });

      break;
    }
  }

  return listed;
}

function getExportedName({
  binding,
  name = binding,
}: BarrelExport): string | undefined {
  return name;
}

function assertIdentifiers(exports: readonly BarrelExport[], barrel: File) {
  for (const exported of exports) {
    for (const identifier of [exported.binding, exported.name]) {
      const valid = (
        identifier === undefined ||
        identifier === defaultBinding ||
        identifierPattern.test(identifier)
      );

      if (!valid) {
        throw new Error(
          `${exported.file} cannot be exported as "${identifier}" in ${barrel}`,
        );
      }
    }
  }
}

function claimNames(
  exports: readonly BarrelExport[],
  spreads: ReadonlyMap<File, readonly BarrelExport[]>,
): NameClaim[] {
  return exports.flatMap((exported) => {
    const name = getExportedName(exported);

    if (name !== undefined) {
      return { name, file: exported.file };
    }

    return (spreads.get(exported.file) ?? []).flatMap((spread) => {
      const spreadName = getExportedName(spread);

      return spreadName === undefined
        ? []
        : { name: spreadName, file: spread.file };
    });
  });
}

function assertDistinctNames(claims: readonly NameClaim[], barrel: File) {
  const owners = new Map<string, File>();

  for (const { name, file } of claims) {
    const owner = owners.get(name);

    if (owner !== undefined) {
      throw new Error(
        `"${name}" is exported by both ${owner} and ${file} in ${barrel}`,
      );
    }

    owners.set(name, file);
  }
}

function renderExport(exported: BarrelExport, specifier: string): string {
  const type = exported.typeOnly === true ? "type " : "";
  const { binding, name } = exported;

  if (binding === undefined) {
    const namespace = name === undefined ? "" : ` as ${name}`;

    return `export ${type}*${namespace} from "${specifier}";`;
  }

  const alias = name === undefined || name === binding
    ? binding
    : `${binding} as ${name}`;

  return `export ${type}{ ${alias} } from "${specifier}";`;
}

export async function renderBarrel({
  plan,
  config,
  imports,
  resolvers,
  spreads,
}: {
  plan: BarrelPlan;
  config: LoadedConfig;
  imports: SubpathImports;
  resolvers: readonly {
    readonly name: string;
    readonly resolve: BarrelExportsResolver;
  }[];
  spreads: ReadonlyMap<File, readonly BarrelExport[]>;
}): Promise<{ content: string; exports: readonly BarrelExport[] }> {
  let exports: readonly BarrelExport[] = [
    ...plan.modules.flatMap(exportModule),
    ...plan.reexports,
  ];

  for (const { name, resolve } of resolvers) {
    exports = validate(
      barrelExportsSchema,
      await resolve(plan.node, exports, config),
      `the exports "${name}" returns for ${plan.file}`,
    );
  }

  assertIdentifiers(exports, plan.file);

  assertDistinctNames(claimNames(exports, spreads), plan.file);

  const rendered = exports.map((exported) => {
    return {
      exported,
      specifier: resolveImportSpecifier(imports, exported.file),
    };
  });

  const sorted = toSorted(rendered, (left, right) => {
    return (
      compareNaturally(left.specifier, right.specifier) ||
      Number(left.exported.typeOnly === true) -
        Number(right.exported.typeOnly === true) ||
      compareNaturally(
        left.exported.binding ?? "",
        right.exported.binding ?? "",
      ) ||
      compareNaturally(left.exported.name ?? "", right.exported.name ?? "")
    );
  });

  const lines = sorted.length === 0
    ? ["export {};"]
    : sorted.map(({ exported, specifier }) => {
        return renderExport(exported, specifier);
      });

  return {
    content: `${barrelHeader}\n\n${lines.join("\n")}\n`,
    exports,
  };
}
