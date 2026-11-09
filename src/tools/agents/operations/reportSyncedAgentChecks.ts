import { includes } from "@auaust/primitive-kit/arrays";

import { claudeTarget } from "#tools/agents/claude/constants";
import { codexTarget } from "#tools/agents/codex/constants";
import { agentsTarget } from "#tools/agents/constants";
import { reportAgentChecks } from "#tools/agents/operations/reportAgentChecks";
import type { SyncDone } from "#project/sync/index";

export async function reportSyncedAgentChecks({
  config,
  targets,
}: SyncDone): Promise<void> {
  const reported = [agentsTarget, claudeTarget, codexTarget];

  if (targets.some((target) => includes(reported, target))) {
    await reportAgentChecks(config);
  }
}
