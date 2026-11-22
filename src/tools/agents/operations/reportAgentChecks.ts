import {
  formatAgentCheck,
  type AgentCheckFinding,
} from "#metalbrain/runtimes/index";
import { checkAgents } from "#tools/agents/operations/checkAgents";
import type { LoadedConfig } from "#project/config/index";

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
