import { codexSkillsDir } from "#tools/agents/codex/constants";
import { createCodexAgentProfiles } from "#tools/agents/codex/operations/createCodexAgentProfiles";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import type { Extension } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";

export async function getCodexProfiles({
  extensions,
  fillers,
}: {
  extensions: readonly Extension[];
  fillers: BlockFillers;
}) {
  const definitions = await getSkillDefinitions({ extensions, fillers });

  return definitions.flatMap(({ name, reference, agent, body, invocation }) => {
    return agent === undefined
      ? []
      : createCodexAgentProfiles({
          agent,
          reference,
          body,
        }).map((profile) => {
          return {
            ...profile,
            reference,
            invocation,
            skillFile: `${codexSkillsDir}/${name}/SKILL.md`,
            policyFile: `${codexSkillsDir}/${name}/agents/openai.yaml`,
          };
        });
  });
}
