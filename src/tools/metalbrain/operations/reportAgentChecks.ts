import {
  checkAgents,
  formatAgentCheck,
  type AgentCheckFinding,
} from "#metalbrain/runtimes/index";
import { loadAgentInputs } from "#tools/metalbrain/operations/loadAgentInputs";
import { loadInstructionFormatter } from "#tools/metalbrain/operations/loadInstructionFormatter";
import type { LoadedConfig } from "#project/config/index";

const levels = {
  "conflicting": "warn",
  "disabled": "warn",
  "unsupported": "warn",
  "configured": "info",
  "runtime-unverified": "info",
} as const satisfies Record<AgentCheckFinding["status"], "warn" | "info">;

/**
 * Checks the preferred agents' integration and reports each finding through the
 * config's reporter, warning on those needing action.
 */
export async function reportAgentChecks(config: LoadedConfig) {
  const findings = await checkAgents({
    ...(await loadAgentInputs(config)),
    format: await loadInstructionFormatter(config),
  });

  const { reporter } = config.context;

  for (const finding of findings) {
    reporter[levels[finding.status]](formatAgentCheck(finding));
  }

  return findings;
}
