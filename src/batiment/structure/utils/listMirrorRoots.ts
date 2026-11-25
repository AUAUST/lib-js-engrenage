import { entries, freeze } from "@auaust/toolkit/object";

import { listNamespaceDirectories } from "#batiment/structure/utils/listNamespaceDirectories";
import type { MirrorRoot } from "#batiment/structure/types/MirrorRoot";
import type { TestsContext } from "#batiment/structure/types/TestsContext";

export function listMirrorRoots({
  namespaces,
}: Pick<TestsContext, "namespaces">): readonly MirrorRoot[] {
  return entries(namespaces).flatMap(([namespace, counterpart]) => {
    if (counterpart === undefined) {
      return [];
    }

    const { dirs, structure } = counterpart;

    const directories = structure === undefined
      ? []
      : listNamespaceDirectories(structure).filter(({ node }) => {
          return node.kind === "directory";
        });

    return directories.length === 0
      ? [
          freeze({
            key: namespace,
            namespace,
            dirs,
          }),
        ]
      : directories.map(({ directory, node }) => {
          return freeze({
            key: node.name,
            namespace,
            dirs: freeze([directory]),
          });
        });
  });
}
