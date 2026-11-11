import { validate } from "#foundation/options/index";
import { skillSchema } from "#tools/agents/config/schemas/skillSchema";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import type { Extension } from "#project/config/index";

export async function getSkillDefinitions(extensions?: readonly Extension[]) {
  const templates = await getInstructionTemplates("skills", extensions);

  return templates.map((template) => {
    const metadata = validate(
      skillSchema,
      template,
      `${template.source} skill metadata`,
    );

    return { ...template, ...metadata };
  });
}
