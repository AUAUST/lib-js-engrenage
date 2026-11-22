import { includes } from "@auaust/toolkit/array";

import { reportAgentChecks } from "#tools/agents/index";
import { claudeTarget } from "#tools/metalbrain/claude/constants";
import { agentsTarget, hookRoots } from "#tools/metalbrain/constants";
import { loadInstructionFormatter } from "#tools/metalbrain/operations/loadInstructionFormatter";
import type { SyncDone } from "#project/sync/index";

export async function reportSyncedAgentChecks({
  config,
  targets,
}: SyncDone): Promise<void> {
  const reported = [agentsTarget, claudeTarget];

  if (targets.some((target) => includes(reported, target))) {
    await reportAgentChecks(config, {
      format: await loadInstructionFormatter(config),
      roots: hookRoots,
    });
  }
}
