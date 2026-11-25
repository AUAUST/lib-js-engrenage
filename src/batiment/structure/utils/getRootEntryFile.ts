import { posix } from "node:path";

import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { File } from "#types/File";

export function getRootEntryFile({
  dirs,
  entryFile,
}: Pick<NamespaceStructure, "dirs" | "entryFile">): File | undefined {
  const [directory] = dirs;

  return directory === undefined || entryFile === undefined
    ? undefined
    : posix.join(directory, entryFile);
}
