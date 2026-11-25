import { posix } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import {
  listForeignPlacements,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import { namespaceMetadataFile } from "#batiment/scopes/constants";
import { fallbackLayer } from "#batiment/structure/constants";
import type { OptionSource, StructureDiagnostic } from "#batiment/report/index";
import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

function isWithin(path: Directory, directory: Directory): boolean {
  return path === directory || path.startsWith(`${directory}/`);
}

export function listDirectoriesRootDiagnostics({
  namespace,
  scope,
  directories,
  placements,
  declaration,
  configOf,
}: {
  namespace: string;
  scope: Directory;
  directories: Directories;
  placements: EnvironmentPlacements;
  declaration: DeclaredStructure["namespaces"][string] | undefined;
  configOf(field: "children" | "layers"): OptionSource;
}): readonly StructureDiagnostic[] {
  const located = {
    severity: "error",
    blocking: true,
    namespace,
    files: freeze([]),
  } as const;

  const names = directories.map((directory) => {
    return posix.relative(scope, directory);
  });

  const unknownLayers = (declaration?.layers ?? []).filter((layer) => {
    return layer !== fallbackLayer && !names.includes(layer);
  });

  const nested = directories.flatMap((outer) => {
    const foreign = listForeignPlacements(placements, outer);

    return directories
      .filter((inner) => {
        return (
          inner.startsWith(`${outer}/`) &&
          !foreign.some(({ dir }) => isWithin(inner, dir))
        );
      })
      .map((inner) => [outer, inner] as const);
  });

  return freeze([
    ...(declaration?.children === undefined
      ? []
      : [
          freeze({
            ...located,
            code: "directories-root-children" as const,
            message: `${namespace} spans the directories ${names.join(", ")}, so its root holds directories and takes no children; set children in each directory's ${namespaceMetadataFile}`,
            config: configOf("children"),
          }),
        ]),
    ...(unknownLayers.length === 0
      ? []
      : [
          freeze({
            ...located,
            code: "unknown-directory-layer" as const,
            message: `${namespace} orders its directories ${names.join(", ")} with root layers naming ${unknownLayers.join(", ")}, none of them; name only its directories, or ${fallbackLayer} for the rest`,
            config: configOf("layers"),
          }),
        ]),
    ...nested.map(([outer, inner]) => {
      return freeze({
        ...located,
        code: "nested-namespace-directory" as const,
        message: `${inner} lies inside ${outer}, another directory of the ${namespace} namespace, with no other environment's placement between: drop it from that namespace's directories, or place another environment between them`,
        path: inner,
      });
    }),
  ]);
}
