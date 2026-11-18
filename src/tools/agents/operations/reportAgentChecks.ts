import { checkAgents } from "#tools/agents/operations/checkAgents";
import { formatAgentCheck } from "#tools/agents/utils/formatAgentCheck";
import type { LoadedConfig } from "#project/config/index";
import type { AgentCheckFinding } from "#tools/agents/types/AgentCheckFinding";

const levels = {
  "conflicting": "warn",
  "disabled": "warn",
  "unsupported": "warn",
  "configured": "info",
  "runtime-unverified": "info",
} as const satisfies Record<AgentCheckFinding["status"], "warn" | "info">;

export async function reportAgentChecks(config: LoadedConfig) {
  const findings = await checkAgents(config);

  const { reporter } = config.context;

  for (const finding of findings) {
    reporter[levels[finding.status]](formatAgentCheck(finding));
  }

  return findings;
}
