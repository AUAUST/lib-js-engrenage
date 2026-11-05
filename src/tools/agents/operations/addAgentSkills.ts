import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function addAgentSkills(
  {
    filesystem,
    agents,
  }: {
    filesystem: Filesystem;
    agents: ResolvedAgents;
  },
  names: readonly string[],
) {
  const templates = getSkillTemplates({ agents });

  for (const name of names) {
    if (!templates.some((template) => template.name === name)) {
      throw new Error(
        `Unknown agent skill "${name}". Available skills: ${templates.map((template) => template.name).join(", ")}`,
      );
    }
  }

  for (const template of templates) {
    if (!names.includes(template.name)) {
      continue;
    }

    for (const { file, content } of template.files) {
      if (!filesystem.exists(file)) {
        filesystem.write(file, content);
      }
    }
  }
}
