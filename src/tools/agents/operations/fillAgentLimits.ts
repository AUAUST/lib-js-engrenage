import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { renderAgentLimits } from "#tools/agents/utils/renderAgentLimits";
import type { LoadedConfig } from "#project/config/index";

export async function fillAgentLimits(config: LoadedConfig): Promise<string> {
  return renderAgentLimits(
    await getSkillDefinitions({
      extensions: await listActiveExtensions(config),
    }),
  );
}
