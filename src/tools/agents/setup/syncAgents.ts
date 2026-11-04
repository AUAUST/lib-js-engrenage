import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import { syncProjectMap } from "#tools/agents/setup/syncProjectMap";

export function syncAgents(
  config: Parameters<typeof syncProjectMap>[0] &
    Parameters<typeof syncAgentFiles>[0],
) {
  syncProjectMap(config);
  syncAgentFiles(config);
}
