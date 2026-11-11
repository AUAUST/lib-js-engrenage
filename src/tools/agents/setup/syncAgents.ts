import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import { syncGeneratedRules } from "#tools/agents/setup/syncGeneratedRules";
import type { LoadedConfig } from "#project/config/index";

export async function syncAgents(config: LoadedConfig) {
  await syncGeneratedRules(config);

  await syncAgentFiles(config);
}
