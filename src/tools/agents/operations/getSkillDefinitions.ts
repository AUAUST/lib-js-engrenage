import { validate } from "#foundation/options/index";
import { skillSchema } from "#tools/agents/config/schemas/skillSchema";
import { skillFileName } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { createSkillFileFiller } from "#tools/agents/utils/createSkillFileFiller";
import { renderFragment } from "#tools/agents/utils/renderFragment";
import type { Extension } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";
import type { Directory } from "#types/Directory";

export async function getSkillDefinitions(config: {
  render?: { fillers: BlockFillers; skillsDirectory: Directory };
  extensions?: readonly Extension[] | undefined;
}) {
  const { render } = config;

  if (render !== undefined && "skill-file" in render.fillers) {
    throw new Error(
      'Agent filler "@skill-file" is built in and cannot be contributed',
    );
  }

  const templates = await getInstructionTemplates("skills", {
    extensions: config.extensions,
    supporting: true,
  });

  return Promise.all(
    templates.map(async (template) => {
      const metadata = validate(
        skillSchema,
        template,
        `${template.source} skill metadata`,
      );

      for (const { name, source } of template.supporting) {
        if (name === skillFileName) {
          throw new Error(
            `Skill "${template.name}" ships a supporting file named ${skillFileName}: ${source}`,
          );
        }
      }

      if (render === undefined) {
        return { ...template, ...metadata };
      }

      const fillers = {
        ...render.fillers,
        "skill-file": createSkillFileFiller({
          directory: render.skillsDirectory,
          skill: template.name,
          files: template.supporting.map(({ name }) => name),
        }),
      };

      const supporting = await Promise.all(
        template.supporting.map(async (supported) => {
          return {
            ...supported,
            body: await renderFragment(
              supported.body,
              supported.source,
              fillers,
            ),
          };
        }),
      );

      return {
        ...template,
        ...metadata,
        body: await renderFragment(template.body, template.source, fillers),
        supporting,
      };
    }),
  );
}
