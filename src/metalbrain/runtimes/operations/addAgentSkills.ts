import { getSkillTemplates } from "#metalbrain/runtimes/operations/getSkillTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FragmentSources } from "#metalbrain/facts/index";
import type {
  FragmentRenderer,
  InstructionRegistry,
} from "#metalbrain/instructions/index";
import type { AgentRuntime } from "#metalbrain/runtimes/ports/AgentRuntime";
import type { HookRoots } from "#metalbrain/runtimes/types/HookRoots";
import type { ResolvedAgents } from "#metalbrain/runtimes/types/ResolvedAgents";

/**
 * Writes the files of the named skills the project lacks.
 *
 * @throws {Error} A name is unknown.
 */
export async function addAgentSkills(
  {
    filesystem,
    ...sources
  }: {
    filesystem: Filesystem;
    agents: ResolvedAgents;
    fragments: FragmentSources;
    instructions: InstructionRegistry;
    renderer: FragmentRenderer;
    runtimes: readonly AgentRuntime[];
    roots: HookRoots;
  },
  names: readonly string[],
) {
  const templates = await getSkillTemplates(sources);

  for (const name of names) {
    if (!templates.some((template) => template.name === name)) {
      throw new Error(
        `Unknown agent skill "${name}". Available skills: ${templates
          .map((template) => {
            return template.name;
          })
          .join(", ")}`,
      );
    }
  }

  for (const template of templates) {
    if (!names.includes(template.name)) {
      continue;
    }

    for (const { file, content } of template.files) {
      if (!(await filesystem.exists(file))) {
        await filesystem.write(file, content);
      }
    }
  }
}
