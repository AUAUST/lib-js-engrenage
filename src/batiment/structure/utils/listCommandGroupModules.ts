import { extname } from "node:path";

import type { File } from "#types/File";

export function listCommandGroupModules(
  strays: readonly File[],
  indexFile: File,
): File[] {
  return strays.filter((file) => {
    return extname(file) === extname(indexFile);
  });
}
