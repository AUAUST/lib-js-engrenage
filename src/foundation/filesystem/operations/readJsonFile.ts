import { readFileSync } from "node:fs";

import { parseJson } from "#foundation/json/index";
import type { File } from "#types/File";

export function readJsonFile(path: File): unknown {
  return parseJson(readFileSync(path, "utf-8"), path);
}
