import { syncAgentFiles } from "#tools/metalbrain/setup/syncAgentFiles";
import { syncGeneratedRules } from "#tools/metalbrain/setup/syncGeneratedRules";
import type { LoadedConfig } from "#project/config/index";

/**
 * Writes the rules `agents.rules` generators return, then syncs agent files
 * through `syncAgentFiles`.
 */
export async function syncAgents(config: LoadedConfig) {
  await syncGeneratedRules(config);

  await syncAgentFiles(config);
}
