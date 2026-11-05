import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import { syncProjectMap } from "#tools/agents/setup/syncProjectMap";
import type { OptionContext } from "#foundation/options/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";
import type { ProjectMapSections } from "#tools/agents/types/ProjectMapSections";

export async function syncAgents(
  config: OptionContext<AgentSections & ProjectMapSections>,
) {
  await syncProjectMap(config);
  await syncAgentFiles(config);
}
