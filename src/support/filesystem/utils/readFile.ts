import type { File } from "#types/File";
import { readFileSync } from "node:fs";

export function readFile(path: File): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}
