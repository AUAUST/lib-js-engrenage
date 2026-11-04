import { getSkillTemplates } from "#agents/operations/getSkillTemplates";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function addAgentSkills(
  config: ResolvedConfig,
  names: readonly string[],
) {
  const templates = getSkillTemplates(config);

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
      if (!config.filesystem.exists(file)) {
        config.filesystem.write(file, content);
      }
    }
  }
}
