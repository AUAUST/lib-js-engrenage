import {
  array,
  looseObject,
  optional,
  picklist,
  strictObject,
  string,
} from "valibot";
import { stringify } from "yaml";

import { validate } from "#foundation/options/index";
import {
  claudeAgentsDir,
  claudeSkillsDir,
} from "#tools/agents/claude/constants";
import { codexSkillsDir } from "#tools/agents/codex/constants";
import {
  claudeAgentFrontmatterKeys,
  claudeSkillFrontmatterKeys,
  codexSkillFrontmatterKeys,
} from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { createInstructionFile } from "#tools/agents/utils/createInstructionFile";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { File } from "#types/File";

const skillSchema = looseObject({
  invocation: optional(picklist(["explicit", "implicit"]), "implicit"),
  agent: optional(
    strictObject({
      name: string(),
      description: string(),
      model: optional(string()),
      effort: optional(picklist(["low", "medium", "high", "xhigh", "max"])),
      disallowedTools: optional(array(string())),
    }),
  ),
});

export function getSkillTemplates({ agents }: { agents: ResolvedAgents }) {
  const preferred = agents.preferred ?? [];

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
        files.push({
          file: `${claudeAgentsDir}/${agent.name}.md`,
          content: createInstructionFile({
            frontmatter: agent,
            reference,
            body,
          }),
          frontmatter: {
            keys: claudeAgentFrontmatterKeys,
            values: agent,
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
