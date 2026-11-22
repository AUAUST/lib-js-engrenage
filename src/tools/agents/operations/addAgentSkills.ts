import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getAgentRuntimes } from "#tools/agents/operations/getAgentRuntimes";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { HookRoots } from "#metalbrain/runtimes/index";
import type { LoadedConfig } from "#project/config/index";

export async function addAgentSkills(
  config: LoadedConfig,
  names: readonly string[],
  roots: HookRoots,
) {
  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const templates = await getSkillTemplates({
    agents,
    extensions: await listActiveExtensions(config),
    renderer: await createFragmentRenderer(config),
    runtimes: await getAgentRuntimes(config),
    roots,
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
