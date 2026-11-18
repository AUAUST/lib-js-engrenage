import { agentLimitsFiller } from "#tools/agents/constants";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { renderAgentLimits } from "#tools/agents/utils/renderAgentLimits";
import type { LoadedConfig } from "#project/config/index";

// @debt reads agent frontmatter through `getSkillDefinitions`, which renders every skill body, so the filler must leave itself out to avoid filling its own marker; a frontmatter-only reader would need neither
export async function fillAgentLimits(config: LoadedConfig): Promise<string> {
  const fillers = Object.fromEntries(
    Object.entries(await createAgentFillers(config)).filter(([name]) => {
      return name !== agentLimitsFiller;
    }),
  );

  return renderAgentLimits(
    await getSkillDefinitions({
      fillers,
      extensions: await listActiveExtensions(config),
    }),
  );
}
