import { readFileSync } from "node:fs";

import type { File } from "#types/File";

export function readJsonFile(path: File): unknown {
  const json = readFileSync(path, "utf8");

  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}`, {
      cause: error,
    });
  }
}
