import { readFile, writeFile } from "node:fs/promises";

import { resolve } from "#foundation/filesystem/index";
import { formatContent } from "#project/format/operations/formatContent";
import type { LoadedConfig } from "#project/config/index";
import type { Formatter } from "#project/format/ports/Formatter";
import type { File } from "#types/File";

export async function formatFile(
  path: File,
  { config, formatter }: { config: LoadedConfig; formatter: Formatter },
): Promise<void> {
  const file = resolve(config.context.root, path);

  const content = await readFile(file, "utf-8");

  const formatted = await formatContent(content, {
    path: file,
    config,
    formatter,
  });

  if (formatted !== content) {
    await writeFile(file, formatted);
  }
}
