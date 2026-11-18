import { syncCodexSkill } from "#tools/agents/codex/index";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { BlockFillers } from "#types/BlockFillers";

export async function addAgentSkills(
  {
    filesystem,
    agents,
    extensions,
    fillers,
  }: {
    filesystem: Filesystem;
    agents: ResolvedAgents;
    extensions?: readonly Extension[] | undefined;
    fillers: BlockFillers;
  },
  names: readonly string[],
) {
  const templates = await getSkillTemplates({
    agents,
    extensions,
    fillers,
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

    if (agents.preferred?.includes("codex") === true) {
      await syncCodexSkill(filesystem, template);
    }
  }
}
