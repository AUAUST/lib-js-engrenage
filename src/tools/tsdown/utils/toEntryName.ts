import { posix } from "node:path";

import type { File } from "#types/File";

export function toEntryName(file: File): string {
  return posix.basename(file) === "index.ts"
    ? posix.dirname(file)
    : file.slice(0, -posix.extname(file).length);
}
