import { agentFiles } from "#agents/presets/agentFiles";
import { readFragment } from "#agents/utils/readFragment";
import { syncBlocks } from "#agents/utils/syncBlocks";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { resolvePath } from "#utils/resolvePath";
import { globSync, readFileSync, writeFileSync } from "node:fs";

export function syncAgentFiles({
  root,
  check = false,
}: {
  root: Directory | URL;
  check?: boolean;
}): File[] {
  const rootPath = resolvePath(root);

  const files = globSync(agentFiles, {
    cwd: rootPath,
  }).sort();

  const outdated: File[] = [];

  for (const file of files) {
    const path = resolvePath(rootPath, file);

    const content = readFileSync(path, "utf8");

    const synced = syncBlocks(content, readFragment);

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
