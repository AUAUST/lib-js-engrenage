import { posix } from "node:path";

import type { File } from "#types/File";

export function toEntryName(
  file: File,
  executableFile: File | undefined,
): string {
  return posix.basename(file) === executableFile
    ? posix.dirname(file)
    : file.slice(0, -posix.extname(file).length);
}
