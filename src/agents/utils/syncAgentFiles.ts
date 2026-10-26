import { globSync, readFileSync } from "node:fs";

import { map, sort } from "@auaust/primitive-kit/arrays";

import { markdownBlocks } from "#agents/constants";
import { resolveAgentReference } from "#agents/utils/resolveAgentReference";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Files } from "#types/Files";

export function syncAgentFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): Files {
  const discovered = globSync(config.agents.instructionFiles, {
    cwd: config.root,
  });

  const files = sort(map(discovered, toPosixPath));

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
