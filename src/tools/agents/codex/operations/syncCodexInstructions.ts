import { syncBlocks } from "#foundation/blocks/index";
import { codexFile } from "#tools/agents/codex/constants";
import { createCodexRuleMapping } from "#tools/agents/codex/operations/createCodexRuleMapping";
import { markdownBlocks } from "#tools/agents/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export async function syncCodexInstructions({
  filesystem,
  agents,
}: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}) {
  if (agents.preferred?.includes("codex") !== true) {
    return;
  }

  const content = await filesystem.read(codexFile);

  if (content === undefined) {
    return;
  }

  const rules = await createCodexRuleMapping({ filesystem });

  await filesystem.write(
    codexFile,
    syncBlocks(content, markdownBlocks, {
      rules() {
        return rules;
      },
    }),
  );
}
