import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { pathExists } from "#foundation/filesystem/index";

const ignoredDirectory = "node_modules";

async function holdsFiles(directory: string): Promise<boolean> {
  const entries = await readdir(directory, { withFileTypes: true });

  const holds = await Promise.all(
    entries.map(async (entry) => {
      return (
        !entry.isDirectory() ||
        (entry.name !== ignoredDirectory &&
          (await holdsFiles(join(directory, entry.name))))
      );
    }),
  );

  return holds.some(Boolean);
}

export async function listStructureDirectories(
  directory: string,
): Promise<string[]> {
  if (!(await pathExists(directory))) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });

  const listed = await Promise.all(
    entries.map(async (entry) => {
      return (
        entry.isDirectory() &&
        entry.name !== ignoredDirectory &&
        (await holdsFiles(join(directory, entry.name)))
      );
    }),
  );

  return entries
    .filter((_, index) => listed[index])
    .map((entry) => entry.name)
    .sort();
}
