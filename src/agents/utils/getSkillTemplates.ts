import {
  array,
  looseObject,
  optional,
  picklist,
  strictObject,
  string,
} from "valibot";
import { stringify } from "yaml";

import { claudeAgentsDir, claudeSkillsDir } from "#agents/claude/constants";
import { codexSkillsDir } from "#agents/codex/constants";
import { createInstructionFile } from "#agents/utils/createInstructionFile";
import { getInstructionTemplates } from "#agents/utils/getInstructionTemplates";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

const skillSchema = looseObject({
  invocation: optional(picklist(["explicit", "implicit"]), "implicit"),
  agent: optional(
    strictObject({
      name: string(),
      description: string(),
      disallowedTools: optional(array(string())),
    }),
  ),
});

export function getSkillTemplates(config: ResolvedConfig) {
  const preferred = config.agents.preferred ?? [];

  if (preferred.length === 0) {
    throw new Error("Skills need agents.preferred in engrenage.config.ts");
  }

  return getInstructionTemplates("skills").map((template) => {
    const { invocation, agent } = validate(
      skillSchema,
      template,
      `${template.source} skill metadata`,
    );

    const { name, description, reference, body } = template;
    const isExplicit = invocation === "explicit";
    const files: { file: File; content: string }[] = [];

    if (preferred.includes("claude")) {
      files.push({
        file: `${claudeSkillsDir}/${name}/SKILL.md`,
        content: createInstructionFile({
          frontmatter: {
            name,
            description,
            ...(isExplicit && {
              "disable-model-invocation": true,
            }),
          },
          reference,
          body,
        }),
      });

      if (agent !== undefined) {
        files.push({
          file: `${claudeAgentsDir}/${agent.name}.md`,
          content: createInstructionFile({
            frontmatter: agent,
            reference,
            body,
          }),
        });
      }
    }

    if (preferred.includes("codex")) {
      files.push({
        file: `${codexSkillsDir}/${name}/SKILL.md`,
        content: createInstructionFile({
          frontmatter: {
            name,
            description,
          },
          reference,
          body,
        }),
      });

      if (isExplicit) {
        files.push({
          file: `${codexSkillsDir}/${name}/agents/openai.yaml`,
          content: stringify({
            policy: {
              allow_implicit_invocation: false,
            },
          }),
        });
      }
    }

    return {
      ...template,
      files,
    };
  });
}
