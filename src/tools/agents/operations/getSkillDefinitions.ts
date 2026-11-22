import { validate } from "#foundation/options/index";
import { skillSchema } from "#tools/agents/config/schemas/skillSchema";
import { skillFileName } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { getSharedFiles } from "#tools/agents/operations/getSharedFiles";
import type { FragmentRenderer } from "#metalbrain/instructions/index";
import type { Extension } from "#project/config/index";
import type { Directory } from "#types/Directory";

export async function getSkillDefinitions(config: {
  render?: { renderer: FragmentRenderer; skillsDirectory: Directory };
  extensions?: readonly Extension[] | undefined;
}) {
  const { render } = config;

  const templates = await getInstructionTemplates("skills", {
    extensions: config.extensions,
    supporting: true,
  });

  const shared = render === undefined
    ? []
    : await getSharedFiles(config.extensions ?? []);

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

      const { renderer, skillsDirectory } = render;

      const files = template.supporting.map(({ name }) => name);

      const referenced = new Set<string>();

      const skill = {
        directory: skillsDirectory,
        skill: template.name,
        files,
        shared: shared.map(({ name }) => name),
        onSharedFile: (file: string) => referenced.add(file),
      };

      const supporting = await Promise.all(
        template.supporting.map(async (supported) => {
          return {
            ...supported,
            body: await renderer.render(
              supported.body,
              supported.source,
              skill,
            ),
          };
        }),
      );

      const body = await renderer.render(template.body, template.source, skill);

      const installed = shared.filter(({ name }) => referenced.has(name));

      for (const { name, source } of installed) {
        if (name === skillFileName || files.includes(name)) {
          throw new Error(
            `Shared file ${name} collides with a file of skill "${template.name}": ${source}`,
          );
        }
      }

      const sharedCopies = await Promise.all(
        installed.map(async (file) => {
          return {
            ...file,
            body: await renderer.render(file.body, file.source),
          };
        }),
      );

      return {
        ...template,
        ...metadata,
        body,
        supporting: [...supporting, ...sharedCopies],
      };
    }),
  );
}
