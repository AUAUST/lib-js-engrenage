import { validate } from "#foundation/options/index";
import { skillSchema } from "#tools/agents/config/schemas/skillSchema";
import { skillFileName } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import type { Extension } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";

export async function getSkillDefinitions(config: {
  fillers?: BlockFillers;
  extensions?: readonly Extension[] | undefined;
}) {
  const templates = await getInstructionTemplates("skills", {
    ...config,
    supporting: true,
  });

  return templates.map((template) => {
    const metadata = validate(
      skillSchema,
      template,
      `${template.source} skill metadata`,
    );

    const [first] = template.supporting;

    if (first !== undefined && metadata.agent !== undefined) {
      throw new Error(
        `Skill "${template.name}" declares an agent, whose files cannot reach supporting files such as ${first.source}`,
      );
    }

    for (const { name, source } of template.supporting) {
      if (name === skillFileName) {
        throw new Error(
          `Skill "${template.name}" ships a supporting file named ${skillFileName}: ${source}`,
        );
      }
    }

    return { ...template, ...metadata };
  });
}
