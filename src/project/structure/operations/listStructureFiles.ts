import { readdir } from "node:fs/promises";

export async function listStructureFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => !entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
