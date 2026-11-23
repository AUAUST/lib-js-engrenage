import {
  createInstructionFile,
  type FragmentRenderer,
  type GeneratedFrontmatter,
  type InstructionRegistry,
} from "#metalbrain/instructions/index";
import {
  claudeAgentFrontmatterKeys,
  claudeSkillFrontmatterKeys,
  claudeStopHook,
  claudeThoroughnessHookArgs,
  metalbrainHook,
  skillFileName,
  skillFrontmatterKeys,
} from "#metalbrain/runtimes/constants";
import { getSkillDefinitions } from "#metalbrain/runtimes/operations/getSkillDefinitions";
import { createHookCommand } from "#metalbrain/runtimes/utils/createHookCommand";
import type { FragmentSources } from "#metalbrain/facts/index";
import type { AgentRuntime } from "#metalbrain/runtimes/ports/AgentRuntime";
import type { HookRoots } from "#metalbrain/runtimes/types/HookRoots";
import type { ResolvedAgents } from "#metalbrain/runtimes/types/ResolvedAgents";
import type { SkillDefinition } from "#metalbrain/runtimes/types/SkillDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function getSkillTemplates({
  agents,
  fragments,
  instructions,
  renderer,
  runtimes,
  roots,
}: {
  agents: ResolvedAgents;
  fragments: FragmentSources;
  instructions: InstructionRegistry;
  renderer: FragmentRenderer;
  runtimes: readonly AgentRuntime[];
  roots: HookRoots;
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
      instructions,
      fragments,
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

  // @debt the entry's top-level `body` belongs to the first preferred runtime; per-runtime renderings would belong in separate fields
  const primary = (
    renderings[0]?.definitions ??
    (await getSkillDefinitions({ instructions, fragments }))
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

      // @debt branches on the runtime's name for its skill frontmatter keys and agent file format, so any contributed runtime gets only a name and description frontmatter and no agent files; the `agents.runtimes` contribution could declare both
      if (runtime.name !== "claude") {
        addSkill(
          directory,
          {
            keys: skillFrontmatterKeys,
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

      // @debt the agent block's keys Claude Code lacks are listed here by hand, so a new one leaks into a newly created agent file's frontmatter until added; picking `claudeAgentFrontmatterKeys` would close it
      const {
        gate,
        efforts: _efforts,
        ceiling: _ceiling,
        thoroughness = "standard",
        ...definition
      } = agent;

      const values = {
        ...definition,
        hooks: {
          PreToolUse: [
            {
              matcher: "*",
              hooks: [
                {
                  type: "command",
                  command: createHookCommand(
                    `${claudeThoroughnessHookArgs} ${thoroughness}`,
                    roots,
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
                    command: createHookCommand(
                      claudeStopHook.args,
                      roots,
                      claudeStopHook.program,
                    ),
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
      files,
    };
  });
}
