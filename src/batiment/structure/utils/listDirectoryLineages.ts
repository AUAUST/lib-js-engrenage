import { freeze } from "@auaust/toolkit/object";

import { listNamespaceDirectories } from "#batiment/structure/utils/listNamespaceDirectories";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { NamespaceDirectory } from "#batiment/structure/types/NamespaceDirectory";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

const namespacePath = ".";

export function listDirectoryLineages(
  structure: Pick<NamespaceStructure, "dirs" | "root">,
): readonly (NamespaceDirectory & {
  readonly lineage: readonly LineageMember[];
})[] {
  const { root } = structure;
  const directories = listNamespaceDirectories(structure);

  const spansDirectories = directories.some(({ node }) => {
    return node !== root;
  });

  const namespace: LineageMember = freeze({
    path: namespacePath,
    kind: "namespace",
    layer: undefined,
    layers: spansDirectories ? root.layers : undefined,
    isolated: spansDirectories && root.relation === "isolated",
  });

  return directories.map(({ directory, node }) => {
    const member: LineageMember = freeze({
      path: directory,
      kind: "directory",
      layer: node.layer,
      layers: node.layers,
      isolated: node.relation === "isolated",
    });

    return freeze({
      directory,
      node,
      lineage: freeze([namespace, member]),
    });
  });
}
