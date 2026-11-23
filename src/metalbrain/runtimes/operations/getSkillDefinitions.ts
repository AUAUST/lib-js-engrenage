import { validate } from "#foundation/options/index";
import {
  createFragmentSources,
  type FragmentSources,
} from "#metalbrain/facts/index";
import {
  getRegisteredTemplates,
  getSharedFiles,
  type FragmentRenderer,
  type InstructionRegistry,
} from "#metalbrain/instructions/index";
import { skillSchema } from "#metalbrain/runtimes/config/schemas/skillSchema";
import { skillFileName } from "#metalbrain/runtimes/constants";
import type { Directory } from "#types/Directory";

export async function getSkillDefinitions(config: {
  instructions: InstructionRegistry;
  render?: { renderer: FragmentRenderer; skillsDirectory: Directory };
  fragments?: FragmentSources | undefined;
}) {
  const { instructions, render } = config;

  const templates = await getRegisteredTemplates("skill", {
    instructions,
    supporting: true,
  });

  const shared = render === undefined
    ? []
    : await getSharedFiles(config.fragments ?? createFragmentSources([]));

  return Promise.all(
    templates.map(
      async ({ invocation = "implicit", agent: block, ...template }) => {
        const { agent } = validate(
          skillSchema,
          { agent: block },
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
          return {
            ...template,
            agent,
            invocation,
          };
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

        const body = await renderer.render(
          template.body,
          template.source,
          skill,
        );

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
          agent,
          invocation,
          body,
          supporting: [...supporting, ...sharedCopies],
        };
      },
    ),
  );
}
