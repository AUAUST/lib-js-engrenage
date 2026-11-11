import { validate } from "#foundation/options/index";
import { skillSchema } from "#tools/agents/config/schemas/skillSchema";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import type { Extension } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";

export async function getSkillDefinitions(config: {
  fillers: BlockFillers;
  extensions?: readonly Extension[] | undefined;
}) {
  const templates = await getInstructionTemplates("skills", config);

  return templates.map((template) => {
    const metadata = validate(
      skillSchema,
      template,
      `${template.source} skill metadata`,
    );

    return { ...template, ...metadata };
  });
}
