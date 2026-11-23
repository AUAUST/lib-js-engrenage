import {
  formatAgentCheck,
  type AgentCheckFinding,
  type HookRoots,
} from "#metalbrain/runtimes/index";
import { checkAgents } from "#tools/agents/operations/checkAgents";
import type { MetalbrainFacts } from "#metalbrain/facts/index";
import type { InstructionFormatter } from "#metalbrain/instructions/index";
import type { LoadedConfig } from "#project/config/index";

const levels = {
  "conflicting": "warn",
  "disabled": "warn",
  "unsupported": "warn",
  "configured": "info",
  "runtime-unverified": "info",
} as const satisfies Record<AgentCheckFinding["status"], "warn" | "info">;

export async function reportAgentChecks(
  config: LoadedConfig,
  {
    format,
    roots,
    facts,
  }: { format: InstructionFormatter; roots: HookRoots; facts: MetalbrainFacts },
) {
  const findings = await checkAgents(config, {
    format,
    roots,
    facts,
  });

  const { reporter } = config.context;

  for (const finding of findings) {
    reporter[levels[finding.status]](formatAgentCheck(finding));
  }

  return findings;
}
