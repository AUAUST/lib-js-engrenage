import { posix } from "node:path";

import { toCamelCase } from "@auaust/primitive-kit/strings";
import { entries, getOwn } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  resolveDomainEntries,
  type EnvironmentStructure,
} from "#project/structure/index";
import { isBelow } from "#tools/typescript/utils/isBelow";
import type { ReexportMode } from "#project/roles/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const subpathPrefix = "./";

function toNamespace(subpath: string): string {
  return toCamelCase(subpath.slice(subpathPrefix.length).replaceAll("/", " "));
}

function reexportAs(
  file: File,
  modes: readonly ReexportMode[],
  namespace: string,
  typeOnly: boolean,
): BarrelExport[] {
  return modes.map((mode) => {
    return {
      file,
      ...(mode === "namespace" ? { name: namespace } : {}),
      ...(typeOnly ? { typeOnly } : {}),
    };
  });
}

export function listRootReexports(
  environment: EnvironmentStructure,
  directory: Directory,
  entryFile: File,
  roleBarrels: readonly BarrelPlan[],
): BarrelExport[] {
  const { root, roles, indexFile } = environment;

  const subpaths = new Map(
    entries(resolveDomainEntries(environment)).map(([subpath, file]) => {
      return [file, subpath] as const;
    }),
  );

  const barrels = new Set(roleBarrels.map(({ file }) => file));

  const domainExports = collectStructureNodes(root)
    .filter((node) => {
      return (
        node.kind === "domain" &&
        node.public === true &&
        isBelow(directory, node.path)
      );
    })
    .flatMap((domain) => {
      const entry = posix.join(domain.path, entryFile);
      const subpath = subpaths.get(entry);

      if (subpath === undefined) {
        throw new Error(`${entry} has no package subpath`);
      }

      return reexportAs(
        entry,
        domain.reexport ?? [],
        toNamespace(subpath),
        false,
      );
    });

  const roleExports = root.children.flatMap((node) => {
    const contract = node.kind === "role" && node.role !== undefined
      ? getOwn(roles, node.role)?.contract
      : undefined;

    const barrel = posix.join(node.path, indexFile);

    const isReexported = (
      contract?.reexport !== undefined &&
      barrels.has(barrel) &&
      isBelow(directory, node.path)
    );

    return isReexported
      ? reexportAs(
          barrel,
          contract.reexport,
          toCamelCase(node.name),
          contract.typeOnly,
        )
      : [];
  });

  return [...domainExports, ...roleExports];
}
