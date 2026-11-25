import { posix } from "node:path";

import { getRootDirectory } from "#batiment/structure/utils/getRootDirectory";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { File } from "#types/File";

export function getRootEntryFile(
  structure: Pick<NamespaceStructure, "dirs" | "root" | "entryFile">,
): File | undefined {
  const directory = getRootDirectory(structure)?.directory;

  return directory === undefined || structure.entryFile === undefined
    ? undefined
    : posix.join(directory, structure.entryFile);
}
