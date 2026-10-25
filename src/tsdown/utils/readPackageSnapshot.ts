import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import type { File } from "#types/File";

export function readPackageSnapshot(path: File): string {
  return JSON.stringify(readJsonFile(path));
}
