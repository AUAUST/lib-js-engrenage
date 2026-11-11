import { stringify } from "yaml";

import { syncBlocks } from "#foundation/blocks/index";
import { markdownBlocks, rulesDirectory } from "#tools/agents/constants";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import type { LoadedConfig } from "#project/config/index";
import type { GeneratedRule } from "#tools/agents/ports/GeneratedRule";
import type { File } from "#types/File";

function createFragment({ directives }: GeneratedRule): string {
  return directives
    .map((directive) => {
      return `${markdownBlocks.open}@${directive}${markdownBlocks.close}\n${markdownBlocks.open}@end${markdownBlocks.close}`;
    })
    .join("\n\n");
}

export async function syncGeneratedRules(config: LoadedConfig) {
  const { resolve, context } = config;

  const [
    filesystem,
    agents,
  ] = await Promise.all([context.filesystem, resolve("agents")]);

  if ((agents.preferred?.length ?? 0) === 0) {
    return;
  }

  const [generators, fillers] = await Promise.all([
    context.registry.contributions("agents.rules", config),
    createAgentFillers(config),
  ]);

  for (const { entry, extension } of generators) {
    const generate = await entry.load();

    const rules = await generate(config, rulesDirectory);

    const written = new Set<File>();

    for (const rule of rules) {
      if (rule.name !== entry.name && !rule.name.startsWith(`${entry.name}/`)) {
        throw new Error(
          `Generated rule "${rule.name}" of ${extension.name} lies outside the "${entry.name}" rules it owns`,
        );
      }

      const file = `${rulesDirectory}/${rule.name}.md`;

      const body = await syncBlocks(
        createFragment(rule),
        markdownBlocks,
        fillers,
        { markers: "drop" },
      );

      const header = rule.paths === undefined
        ? ""
        : `---\n${stringify({ paths: rule.paths })}---\n\n`;

      await filesystem.write(file, `${header}${body.trim()}\n`);

      written.add(file);
    }

    const owned = await filesystem.glob([
      `${rulesDirectory}/${entry.name}.md`,
      `${rulesDirectory}/${entry.name}/*.md`,
    ]);

    for (const file of owned) {
      if (!written.has(file)) {
        await filesystem.remove(file);
      }
    }
  }
}
