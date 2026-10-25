import { createRequire } from "node:module";

import type { File } from "#types/File";

export function resolveReference(reference: string, from: File): File {
  return createRequire(from).resolve(reference);
}
