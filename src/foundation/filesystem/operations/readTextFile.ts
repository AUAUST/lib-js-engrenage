import { readFile } from "node:fs/promises";

import { isMissingError } from "#foundation/filesystem/utils/isMissingError";
import type { File } from "#types/File";

export async function readTextFile(path: File): Promise<string | undefined> {
  try {
    return await readFile(path, "utf-8");
  } catch (error) {
    if (isMissingError(error)) {
      return;
    }

    throw error;
  }
}
