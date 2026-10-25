import type { File } from "#types/File";
import { createRequire } from "node:module";

export function resolveReference(reference: string, from: File): File {
  return createRequire(from).resolve(reference);
}
