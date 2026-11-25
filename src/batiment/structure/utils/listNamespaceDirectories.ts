import type { NamespaceDirectory } from "#batiment/structure/types/NamespaceDirectory";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

export function listNamespaceDirectories({
  dirs,
  root,
}: Pick<NamespaceStructure, "dirs" | "root">): readonly NamespaceDirectory[] {
  const nodes = root.children.filter(({ kind }) => kind === "directory");

  return nodes.length === 0
    ? dirs.map((directory) => {
        return { directory, node: root };
      })
    : nodes.map((node) => {
        return { directory: node.path, node };
      });
}
