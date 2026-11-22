import { backlog } from "#metalbrain/backlog/constants";
import {
  findRecordViolations,
  throwViolations,
} from "#metalbrain/records/index";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import type { LoadedConfig } from "#project/config/index";

export async function checkBacklog(config: LoadedConfig): Promise<void> {
  const agents = await config.resolve("agents");

  if (!hasPreferredAgents(agents)) {
    return;
  }

  throwViolations(
    "Backlog categories depart from the backlog file schema:",
    await findRecordViolations(
      config.context.filesystem,
      backlog,
      agents.budgets[backlog.budget],
    ),
  );
}
