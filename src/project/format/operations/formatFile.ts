import { readFile, writeFile } from "node:fs/promises";

import { resolve } from "#foundation/filesystem/index";
import { formatContent } from "#project/format/operations/formatContent";
import type { Formatter } from "#project/format/ports/Formatter";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function formatFile(
  path: File,
  { root, formatter }: { root: Directory; formatter: Formatter },
): Promise<void> {
  const file = resolve(root, path);
  const content = await readFile(file, "utf-8");

  const formatted = await formatContent(content, {
    path: file,
    root,
    formatter,
  });

  if (formatted !== content) {
    await writeFile(file, formatted);
  }
}
