import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import { syncProjectMap } from "#tools/agents/setup/syncProjectMap";
import type { LoadedConfig } from "#project/config/index";

export async function syncAgents(config: LoadedConfig) {
  await syncProjectMap(config);
  await syncAgentFiles(config);
}
