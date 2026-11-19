import { codexSkillsDir } from "#tools/agents/codex/constants";
import { createCodexAgentProfiles } from "#tools/agents/codex/operations/createCodexAgentProfiles";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { formatSkillBody } from "#tools/agents/operations/formatSkillBody";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import type { Extension, LoadedConfig } from "#project/config/index";
import type { Formatter } from "#project/format/index";

export async function getCodexProfiles({
  extensions,
  config,
  formatter,
}: {
  extensions: readonly Extension[];
  config: LoadedConfig;
  formatter: Formatter | undefined;
}) {
  const definitions = await getSkillDefinitions({
    extensions,
    render: {
      renderer: await createFragmentRenderer(config),
      skillsDirectory: codexSkillsDir,
    },
  });

  const profiles = await Promise.all(
    definitions.map(async ({ name, reference, agent, body, invocation }) => {
      if (agent === undefined) {
        return [];
      }

      const skillFile = `${codexSkillsDir}/${name}/SKILL.md`;

      const formatted = await formatSkillBody(body, {
        path: skillFile,
        config,
        formatter,
      });

      return createCodexAgentProfiles({
        agent,
        reference,
        body: formatted,
      }).map((profile) => {
        return {
          ...profile,
          reference,
          invocation,
          skillFile,
          policyFile: `${codexSkillsDir}/${name}/agents/openai.yaml`,
        };
      });
    }),
  );

  return profiles.flat();
}
