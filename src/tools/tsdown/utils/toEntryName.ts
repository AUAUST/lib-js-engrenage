import { posix } from "node:path";

import type { File } from "#types/File";

export function toEntryName(file: File, indexFile: File): string {
  return posix.basename(file) === indexFile
    ? posix.dirname(file)
    : file.slice(0, -posix.extname(file).length);
}
