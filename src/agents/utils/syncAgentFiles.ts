import { agentFiles } from "#config/agents/agentFiles";
import { markdownBlocks } from "#config/agents/markdownBlocks";
import { readFragment } from "#agents/utils/readFragment";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { resolvePath } from "#utils/resolvePath";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import { globSync } from "node:fs";

export function syncAgentFiles({
  root,
  check = false,
}: {
  root: Directory | URL;
  check?: boolean;
}): File[] {
  const files = globSync(agentFiles, {
    cwd: resolvePath(root),
  }).sort();

  return syncFiles({
    root,
    files,
    check,
    update(content) {
      return syncBlocks(content, markdownBlocks, readFragment);
    },
  });
}
