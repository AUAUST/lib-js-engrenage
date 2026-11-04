import { createRequire } from "node:module";

import type { File } from "#types/File";

export function resolveDataFile(specifier: string): File {
  return createRequire(import.meta.url).resolve(specifier);
}
