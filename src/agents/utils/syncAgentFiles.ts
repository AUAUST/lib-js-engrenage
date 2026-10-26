import { globSync, readFileSync } from "node:fs";

import { markdownBlocks } from "#agents/constants";
import { resolveAgentReference } from "#agents/utils/resolveAgentReference";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

export function syncAgentFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): readonly File[] {
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
