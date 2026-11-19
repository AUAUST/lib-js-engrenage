import { loadFormatter } from "#project/format/index";
import { syncCodexSkill } from "#tools/agents/codex/index";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { LoadedConfig } from "#project/config/index";

export async function addAgentSkills(
  config: LoadedConfig,
  names: readonly string[],
) {
  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const templates = await getSkillTemplates({
    agents,
    extensions: await listActiveExtensions(config),
    fillers: await createAgentFillers(config),
  });

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

  const formatter = await loadFormatter(config);

  for (const template of templates) {
    if (!names.includes(template.name)) {
      continue;
    }

    for (const { file, content } of template.files) {
      if (!(await filesystem.exists(file))) {
        await filesystem.write(file, content);
      }
    }

    if (agents.preferred?.includes("codex") === true) {
      await syncCodexSkill(filesystem, template, { config, formatter });
    }
  }
}
