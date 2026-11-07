import { validate } from "#foundation/options/index";
import { skillSchema } from "#tools/agents/config/schemas/skillSchema";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";

export async function getSkillDefinitions() {
  const templates = await getInstructionTemplates("skills");

  return templates.map((template) => {
    const metadata = validate(
      skillSchema,
      template,
      `${template.source} skill metadata`,
    );

    return { ...template, ...metadata };
  });
}
