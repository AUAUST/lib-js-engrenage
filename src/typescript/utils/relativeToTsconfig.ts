import { dirname, relative } from "node:path/posix";

import type { File } from "#types/File";

export function relativeToTsconfig(tsconfig: File, path: string): string {
  return relative(dirname(tsconfig), path);
}
