import { syncBlocks } from "#foundation/blocks/utils/syncBlocks";
import { codexFile } from "#tools/agents/codex/constants";
import { createCodexRuleMapping } from "#tools/agents/codex/operations/createCodexRuleMapping";
import { markdownBlocks } from "#tools/agents/constants";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function syncCodexInstructions({
  filesystem,
  agents,
}: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}) {
  if (agents.preferred?.includes("codex") !== true) {
    return;
  }

  const content = filesystem.read(codexFile);

  if (content !== undefined) {
    filesystem.write(
      codexFile,
      syncBlocks(content, markdownBlocks, {
        rules() {
          return createCodexRuleMapping({ filesystem });
        },
      }),
    );
  }
}
