import { listNamespaceDirectories } from "#batiment/structure/utils/listNamespaceDirectories";
import type { NamespaceDirectory } from "#batiment/structure/types/NamespaceDirectory";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

export function getRootDirectory(
  structure: Pick<NamespaceStructure, "dirs" | "root">,
): NamespaceDirectory | undefined {
  const [directory] = structure.dirs;

  return listNamespaceDirectories(structure).find((each) => {
    return each.directory === directory;
  });
}
