import { readFileSync } from "node:fs";

import type { File } from "#types/File";

export function readFile(path: File): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}
