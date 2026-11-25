import { freeze } from "@auaust/toolkit/object";

import { namespaceMetadataFile } from "#batiment/scopes/constants";
import { fallbackLayer } from "#batiment/structure/constants";
import type { OptionSource, StructureDiagnostic } from "#batiment/report/index";
import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";

export function listDirectoriesRootDiagnostics({
  namespace,
  directories,
  declaration,
  configOf,
}: {
  namespace: string;
  directories: readonly string[];
  declaration: DeclaredStructure["namespaces"][string] | undefined;
  configOf(field: "children" | "layers"): OptionSource;
}): readonly StructureDiagnostic[] {
  const located = {
    severity: "error",
    blocking: true,
    namespace,
    files: freeze([]),
  } as const;

  const unknownLayers = (declaration?.layers ?? []).filter((layer) => {
    return layer !== fallbackLayer && !directories.includes(layer);
  });

  return freeze([
    ...(declaration?.children === undefined
      ? []
      : [
          freeze({
            ...located,
            code: "directories-root-children" as const,
            message: `${namespace} spans the directories ${directories.join(", ")}, so its root holds directories and takes no children; set children in each directory's ${namespaceMetadataFile}`,
            config: configOf("children"),
          }),
        ]),
    ...(unknownLayers.length === 0
      ? []
      : [
          freeze({
            ...located,
            code: "unknown-directory-layer" as const,
            message: `${namespace} orders its directories ${directories.join(", ")} with root layers naming ${unknownLayers.join(", ")}, none of them; name only its directories, or ${fallbackLayer} for the rest`,
            config: configOf("layers"),
          }),
        ]),
  ]);
}
