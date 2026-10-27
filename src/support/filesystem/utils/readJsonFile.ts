import { readFileSync } from "node:fs";

import { parseJson } from "#support/json/utils/parseJson";
import type { File } from "#types/File";

export function readJsonFile(path: File): unknown {
  return parseJson(readFileSync(path, "utf8"), path);
}
