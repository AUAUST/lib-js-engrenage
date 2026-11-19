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
  skillFileName,
} from "#tools/agents/constants";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { createHookCommand } from "#tools/agents/utils/createHookCommand";
import { createInstructionFile } from "#tools/agents/utils/createInstructionFile";
import type { Extension } from "#project/config/index";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";
import type { BlockFillers } from "#types/BlockFillers";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

// @debt callers pass any filler set, so one missing a directive a shipped skill uses fails only at render; deriving the fillers from the loaded config here would remove the parameter
export async function getSkillTemplates({
  agents,
  extensions,
  fillers,
}: {
  agents: ResolvedAgents;
  extensions?: readonly Extension[] | undefined;
  fillers: BlockFillers;
}) {
  const preferred = agents.preferred ?? [];

  if (preferred.length === 0) {
    throw new Error("Skills need agents.preferred in engrenage.config.ts");
  }

  function render(skillsDirectory: Directory) {
    return getSkillDefinitions({
      extensions,
      render: { fillers, skillsDirectory },
    });
  }

  const claude = preferred.includes("claude")
    ? await render(claudeSkillsDir)
    : [];

  const codex = preferred.includes("codex") ? await render(codexSkillsDir) : [];

  const claudeByName = new Map(
    claude.map((definition) => [definition.name, definition]),
  );

  const codexByName = new Map(
    codex.map((definition) => [definition.name, definition]),
  );

  // @debt the entry's top-level `body` belongs to one runtime, Codex's when preferred since `addAgentSkills` hands the entry to `syncCodexSkill`; per-runtime renderings would belong in separate fields
  const primary = preferred.includes("codex")
    ? codex
    : preferred.includes("claude")
      ? claude
      : await getSkillDefinitions({ extensions });

  return primary.map((template) => {
    const { invocation, agent, name, description } = template;

    function findRendering(renderings: ReadonlyMap<string, SkillDefinition>) {
      const rendering = renderings.get(name);

      if (rendering === undefined) {
        throw new Error(
          `Skill "${name}" is missing from a runtime's rendering`,
        );
      }

      return rendering;
    }

    const isExplicit = invocation === "explicit";

    const files: {
      file: File;
      content: string;
      reference: string;
      body: string;
      frontmatter?: GeneratedFrontmatter;
      skillFile?: File;
    }[] = [];

    function addSkill(
      directory: Directory,
      frontmatter: GeneratedFrontmatter,
      { reference, body, supporting }: SkillDefinition,
    ) {
      const skillFile = `${directory}/${name}/${skillFileName}`;

      files.push({
        file: skillFile,
        content: createInstructionFile({
          frontmatter: frontmatter.values,
          reference,
          body,
        }),
        reference,
        body,
        frontmatter,
      });

      for (const supported of supporting) {
        files.push({
          file: `${directory}/${name}/${supported.name}`,
          content: createInstructionFile({
            reference: supported.reference,
            body: supported.body,
          }),
          reference: supported.reference,
          body: supported.body,
          skillFile,
        });
      }
    }

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

      const rendering = findRendering(claudeByName);

      addSkill(claudeSkillsDir, frontmatter, rendering);

      if (agent !== undefined) {
        const { reference, body } = rendering;

        const { gate, efforts: _efforts, ...definition } = agent;

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
          reference,
          body,
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

      addSkill(codexSkillsDir, frontmatter, findRendering(codexByName));
    }

    return {
      ...template,
      invocation,
      agent,
      profiles: preferred.includes("codex") && agent !== undefined
        ? createCodexAgentProfiles({
            agent,
            reference: template.reference,
            body: findRendering(codexByName).body,
          })
        : [],
      files,
    };
  });
}
