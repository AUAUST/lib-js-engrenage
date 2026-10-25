import { readFile } from "#support/filesystem/utils/readFile";
import type { File } from "#types/File";

export function readJsonFile(path: File): unknown {
  const json = readFile(path);

  if (json === undefined) {
    return null;
  }

  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}`, {
      cause: error,
    });
  }
}
