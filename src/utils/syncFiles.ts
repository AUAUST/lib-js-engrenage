import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { resolvePath } from "#utils/resolvePath";
import { readFileSync, writeFileSync } from "node:fs";

export function syncFiles({
  root,
  files,
  check,
  update,
}: {
  root: Directory | URL;
  files: File[];
  check: boolean;
  update: (content: string, path: File) => string;
}): File[] {
  const outdated: File[] = [];

  for (const file of files) {
    const path = resolvePath(root, file);

    const content = readFileSync(path, "utf8");

    const synced = update(content, path);

    if (synced === content) {
      continue;
    }

    outdated.push(file);

    if (!check) {
      writeFileSync(path, synced);
    }
  }

  return outdated;
}
