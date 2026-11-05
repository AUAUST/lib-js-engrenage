import { readFile } from "node:fs/promises";

import { parseJson } from "#foundation/json/index";
import type { File } from "#types/File";

export async function readJsonFile(path: File): Promise<unknown> {
  return parseJson(await readFile(path, "utf-8"), path);
}
