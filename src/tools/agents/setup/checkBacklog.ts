import { findBacklogViolations } from "#tools/agents/operations/findBacklogViolations";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import { throwViolations } from "#tools/agents/utils/throwViolations";
import type { LoadedConfig } from "#project/config/index";

export async function checkBacklog(config: LoadedConfig): Promise<void> {
  const agents = await config.resolve("agents");

  if (!hasPreferredAgents(agents)) {
    return;
  }

  throwViolations(
    "Backlog categories depart from the backlog file schema:",
    await findBacklogViolations(
      config.context.filesystem,
      agents.budgets.backlogEntry,
    ),
  );
}
