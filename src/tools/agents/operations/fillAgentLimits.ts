import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { renderAgentLimits } from "#tools/agents/utils/renderAgentLimits";
import type { LoadedConfig } from "#project/config/index";

// @debt each block filled rereads and reparses every shipped skill, and sync steps rebuild the same skill definitions again: one run computes them many times
export async function fillAgentLimits(
  config: LoadedConfig,
  ...names: string[]
): Promise<string> {
  const definitions = await getSkillDefinitions({
    extensions: await listActiveExtensions(config),
  });

  if (names.length === 0) {
    return renderAgentLimits(definitions);
  }

  return renderAgentLimits(
    names.flatMap((name) => {
      return definitions.filter(({ agent }) => {
        return agent?.name === name;
      });
    }),
  );
}
