import { markdownBlocks } from "#agents/constants";
import { resolveAgentReference } from "#agents/utils/resolveAgentReference";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Files } from "#types/File";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import { globSync, readFileSync } from "node:fs";

export function syncAgentFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): Files {
  const files = globSync(config.agents.instructionFiles, {
    cwd: config.root,
  }).sort();

  return syncFiles({
    root: config.root,
    files,
    check,
    update(content, path) {
      return syncBlocks(content, markdownBlocks, {
        reference(reference) {
          const source = resolveAgentReference(config, reference, path);

          return readFileSync(source, "utf8");
        },
      });
    },
  });
}
