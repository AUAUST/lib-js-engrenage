import { checkPeerOrder } from "#batiment/structure/utils/checkPeerOrder";
import { listDirectoryLineages } from "#batiment/structure/utils/listDirectoryLineages";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { Directory } from "#types/Directory";

/**
 * Lists the directories of `structure` whose modules the code of `directory`
 * may import under the boundary rules: itself, those in lower layers of the
 * namespace's root, and its peers unless the root isolates them.
 *
 * @throws When `directory` is none of the namespace's directories.
 */
export function listImportableDirectories(
  structure: Pick<NamespaceStructure, "name" | "dirs" | "root">,
  directory: Directory,
): readonly Directory[] {
  const lineages = listDirectoryLineages(structure);

  const own = lineages.find((each) => each.directory === directory);

  if (own === undefined) {
    throw new Error(
      `${directory} is no directory of the ${structure.name} namespace`,
    );
  }

  const [container, from] = own.lineage;

  return lineages
    .filter(({ lineage: [, to] }) => {
      return (
        to === from ||
        (container !== undefined &&
          from !== undefined &&
          to !== undefined &&
          checkPeerOrder(container, from, to) === undefined)
      );
    })
    .map((each) => each.directory);
}
