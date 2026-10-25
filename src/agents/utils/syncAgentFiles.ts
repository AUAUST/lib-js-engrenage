import { agentFiles } from "#config/agents/agentFiles";
import { markdownBlocks } from "#config/agents/markdownBlocks";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { resolvePath } from "#utils/resolvePath";
import { resolveReference } from "#utils/resolveReference";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import { globSync, readFileSync } from "node:fs";

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
    update(content, path) {
      return syncBlocks(content, markdownBlocks, (reference) => {
        return readFileSync(resolveReference(reference, path), "utf8");
      });
    },
  });
}
