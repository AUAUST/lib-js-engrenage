import { readFileSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";

import { markdownBlocks } from "#agents/constants";
import { resolveAgentReference } from "#agents/utils/resolveAgentReference";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

export function syncAgentFiles(config: ResolvedConfig) {
  const discovered = config.filesystem.glob(config.agents.instructionFiles);

  function update(content: string, path: File): string {
    return syncBlocks(content, markdownBlocks, {
      reference(reference) {
        if (reference === undefined) {
          throw new Error(`Expected a reference in a marker of ${path}`);
        }

        const source = resolveAgentReference(config, reference, path);

        return readFileSync(source, "utf-8");
      },
    });
  }

  const files = map(discovered, (file) => {
    return {
      file,
      update,
    };
  });

  syncFiles(config, files);
}
