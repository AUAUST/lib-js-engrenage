import { validate } from "#foundation/options/index";
import {
  createFragmentSources,
  type FragmentSources,
} from "#metalbrain/facts/index";
import {
  getInstructionTemplates,
  getSharedFiles,
  type FragmentRenderer,
} from "#metalbrain/instructions/index";
import { skillSchema } from "#metalbrain/runtimes/config/schemas/skillSchema";
import { skillFileName } from "#metalbrain/runtimes/constants";
import type { Directory } from "#types/Directory";

export async function getSkillDefinitions(config: {
  render?: { renderer: FragmentRenderer; skillsDirectory: Directory };
  fragments?: FragmentSources | undefined;
}) {
  const { render } = config;

  const templates = await getInstructionTemplates("skills", {
    fragments: config.fragments,
    supporting: true,
  });

  const shared = render === undefined
    ? []
    : await getSharedFiles(config.fragments ?? createFragmentSources([]));

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
