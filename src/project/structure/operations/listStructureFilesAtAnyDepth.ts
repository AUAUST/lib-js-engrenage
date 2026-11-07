import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { flat } from "@auaust/primitive-kit/arrays";

const ignoredDirectory = "node_modules";

export async function listStructureFilesAtAnyDepth(
  directory: string,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });

  const listed = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) {
        return [entry.name];
      }

      if (entry.name === ignoredDirectory) {
        return [];
      }

      const nested = await listStructureFilesAtAnyDepth(
        join(directory, entry.name),
      );

      return nested.map((file) => join(entry.name, file));
    }),
  );

  return flat(listed).sort();
}
