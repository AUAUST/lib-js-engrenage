import {
  claudeBudgetHookArgs,
  claudeStopHook,
  metalbrainHook,
} from "#tools/agents/claude/constants";
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
import type { AgentRuntime } from "#tools/agents/ports/AgentRuntime";
import type { FragmentRenderer } from "#tools/agents/types/FragmentRenderer";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function getSkillTemplates({
  agents,
  extensions,
  renderer,
  runtimes,
}: {
  agents: ResolvedAgents;
  extensions: readonly Extension[];
  renderer: FragmentRenderer;
  runtimes: readonly AgentRuntime[];
}) {
  const preferred = agents.preferred ?? [];

  if (preferred.length === 0) {
    throw new Error("Skills need agents.preferred in engrenage.config.ts");
  }

  const renderings: {
    runtime: AgentRuntime;
    skills: Directory;
    byName: ReadonlyMap<string, SkillDefinition>;
    definitions: readonly SkillDefinition[];
  }[] = [];

  for (const runtime of runtimes) {
    const { name, skills } = runtime;

    if (skills === undefined || !preferred.some((agent) => agent === name)) {
      continue;
    }

    const definitions = await getSkillDefinitions({
      extensions,
      render: { renderer, skillsDirectory: skills },
    });

    renderings.push({
      runtime,
      skills,
      byName: new Map(
        definitions.map((definition) => [definition.name, definition]),
      ),
      definitions,
    });
  }

  const codex = renderings.find(({ runtime }) => runtime.name === "codex");

  // @debt the entry's top-level `body` belongs to one runtime, Codex's when preferred since `addAgentSkills` hands the entry to `syncCodexSkill`; per-runtime renderings would belong in separate fields
  const primary = (
    (codex ?? renderings[0])?.definitions ??
    (await getSkillDefinitions({ extensions }))
  );

  return primary.map((template) => {
    const { invocation, agent, name, description } = template;

    function findRendering(byName: ReadonlyMap<string, SkillDefinition>) {
      const rendering = byName.get(name);

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

    for (const { runtime, skills: directory, byName } of renderings) {
      const rendering = findRendering(byName);

      // @debt branches on the runtime's name for its skill frontmatter keys and agent file format, so any contributed runtime gets Codex's frontmatter and no agent files; the `agents.runtimes` contribution could declare both
      if (runtime.name !== "claude") {
        addSkill(
          directory,
          {
            keys: codexSkillFrontmatterKeys,
            values: { name, description },
          },
          rendering,
        );

        continue;
      }

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

      addSkill(directory, frontmatter, rendering);

      if (agent === undefined || runtime.agents === undefined) {
        continue;
      }

      const { reference, body } = rendering;

      const {
        gate,
        efforts: _efforts,
        budget = "standard",
        ...definition
      } = agent;

      const values = {
        ...definition,
        hooks: {
          // @debt unverified whether Claude Code reruns frontmatter hooks for an agent resumed through SendMessage, which would leave resumed agents unchecked
          PreToolUse: [
            {
              matcher: "*",
              hooks: [
                {
                  type: "command",
                  command: createHookCommand(
                    `${claudeBudgetHookArgs} ${budget}`,
                    metalbrainHook,
                  ),
                },
              ],
            },
          ],
          ...(gate === true && {
            Stop: [
              {
                hooks: [
                  {
                    type: "command",
                    command: createHookCommand(claudeStopHook.args),
                  },
                ],
              },
            ],
          }),
        },
      };

      files.push({
        file: `${runtime.agents}/${agent.name}.md`,
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

    return {
      ...template,
      invocation,
      agent,
      profiles: codex !== undefined && agent !== undefined
        ? createCodexAgentProfiles({
            agent,
            reference: template.reference,
            body: findRendering(codex.byName).body,
          })
        : [],
      files,
    };
  });
}
