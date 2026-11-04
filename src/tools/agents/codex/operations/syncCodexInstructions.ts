import { syncBlocks } from "#foundation/blocks/utils/syncBlocks";
import { codexFile } from "#tools/agents/codex/constants";
import { createCodexRuleMapping } from "#tools/agents/codex/operations/createCodexRuleMapping";
import { markdownBlocks } from "#tools/agents/constants";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

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
