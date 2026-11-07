import { checkAgents } from "#tools/agents/operations/checkAgents";
import type { LoadedConfig } from "#project/config/index";

export async function reportAgentChecks(config: LoadedConfig) {
  const findings = await checkAgents(config);

  for (const { agent, status, message } of findings) {
    console.info(`${agent} · ${status} · ${message}`);
  }

  return findings;
}
