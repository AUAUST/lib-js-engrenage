import {
  claudeAgentsDir,
  claudeSkillsDir,
  claudeStopHook,
} from "#tools/agents/claude/constants";
import { codexSkillsDir } from "#tools/agents/codex/constants";
import { createCodexAgentProfiles } from "#tools/agents/codex/index";
import {
  claudeAgentFrontmatterKeys,
  claudeSkillFrontmatterKeys,
  codexSkillFrontmatterKeys,
} from "#tools/agents/constants";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { createHookCommand } from "#tools/agents/utils/createHookCommand";
import { createInstructionFile } from "#tools/agents/utils/createInstructionFile";
import type { Extension } from "#project/config/index";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

export async function getSkillTemplates({
  agents,
  extensions,
  fillers,
}: {
  agents: ResolvedAgents;
  extensions?: readonly Extension[];
  fillers: BlockFillers;
}) {
  const preferred = agents.preferred ?? [];

  if (preferred.length === 0) {
    throw new Error("Skills need agents.preferred in engrenage.config.ts");
  }

  const templates = await getSkillDefinitions({ extensions, fillers });

  return templates.map((template) => {
    const { invocation, agent, name, description, reference, body } = template;
    const isExplicit = invocation === "explicit";

    const files: {
      file: File;
      content: string;
      frontmatter?: GeneratedFrontmatter;
    }[] = [];

    if (preferred.includes("claude")) {
      const frontmatter = {
        keys: claudeSkillFrontmatterKeys,
        values: {
          name,
          description,
          ...(isExplicit && {
            "disable-model-invocation": true,
          }),
        },
      };

      files.push({
        file: `${claudeSkillsDir}/${name}/SKILL.md`,
        content: createInstructionFile({
          frontmatter: frontmatter.values,
          reference,
          body,
        }),
        frontmatter,
      });

      if (agent !== undefined) {
        const { gate, ...definition } = agent;

        const values = {
          ...definition,
          ...(gate === true && {
            hooks: {
              Stop: [
                {
                  hooks: [
                    {
                      type: "command",
                      command: createHookCommand(claudeStopHook.command),
                    },
                  ],
                },
              ],
            },
          }),
        };

        files.push({
          file: `${claudeAgentsDir}/${agent.name}.md`,
          content: createInstructionFile({
            frontmatter: values,
            reference,
            body,
          }),
          frontmatter: {
            keys: claudeAgentFrontmatterKeys,
            values,
          },
        });
      }
    }

    if (preferred.includes("codex")) {
      const frontmatter = {
        keys: codexSkillFrontmatterKeys,
        values: {
          name,
          description,
        },
      };

      files.push({
        file: `${codexSkillsDir}/${name}/SKILL.md`,
        content: createInstructionFile({
          frontmatter: frontmatter.values,
          reference,
          body,
        }),
        frontmatter,
      });
    }

    return {
      ...template,
      invocation,
      agent,
      profiles: preferred.includes("codex") && agent !== undefined
        ? createCodexAgentProfiles({
            agent,
            reference,
            body,
          })
        : [],
      files,
    };
  });
}
