import { globSync, readFileSync } from "node:fs";

import { map, sort } from "@auaust/primitive-kit/arrays";

import { markdownBlocks } from "#agents/constants";
import { resolveAgentReference } from "#agents/utils/resolveAgentReference";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { SyncResults } from "#types/SyncResults";

export function syncAgentFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  const discovered = globSync(config.agents.instructionFiles, {
    cwd: config.root,
  });

  function update(content: string, path: File): string {
    return syncBlocks(content, markdownBlocks, {
      reference(reference) {
        const source = resolveAgentReference(config, reference, path);

        return readFileSync(source, "utf8");
      },
    });
  }

  const files = map(sort(map(discovered, toPosixPath)), (file) => {
    return {
      file,
      update,
    };
  });

  return syncFiles({
    root: config.root,
    files,
    check,
  });
}
