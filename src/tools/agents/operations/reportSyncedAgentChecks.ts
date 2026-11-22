import { includes } from "@auaust/toolkit/array";

import { claudeTarget } from "#tools/agents/claude/constants";
import { agentsTarget } from "#tools/agents/constants";
import { reportAgentChecks } from "#tools/agents/operations/reportAgentChecks";
import type { SyncDone } from "#project/sync/index";

export async function reportSyncedAgentChecks({
  config,
  targets,
}: SyncDone): Promise<void> {
  const reported = [agentsTarget, claudeTarget];

  if (targets.some((target) => includes(reported, target))) {
    await reportAgentChecks(config);
  }
}
