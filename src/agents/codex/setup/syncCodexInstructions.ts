import { codexFile } from "#agents/codex/constants";
import { createCodexRuleMapping } from "#agents/codex/utils/createCodexRuleMapping";
import { markdownBlocks } from "#agents/constants";
import { syncBlocks } from "#utils/syncBlocks";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function syncCodexInstructions(config: ResolvedConfig) {
  if (config.agents.preferred?.includes("codex") !== true) {
    return;
  }

  const content = config.filesystem.read(codexFile);

  if (content !== undefined) {
    config.filesystem.write(
      codexFile,
      syncBlocks(content, markdownBlocks, {
        rules() {
          return createCodexRuleMapping(config);
        },
      }),
    );
  }
}
