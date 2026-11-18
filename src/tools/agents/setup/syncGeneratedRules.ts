import { stringify } from "yaml";

import { formatBlockMarker, syncBlocks } from "#foundation/blocks/index";
import { loadLazy } from "#foundation/modules/index";
import { listLocationGlobs, type LoadedConfig } from "#project/config/index";
import {
  endMarker,
  markdownBlocks,
  rulesDirectory,
} from "#tools/agents/constants";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import type { GeneratedRule } from "#tools/agents/ports/GeneratedRule";
import type { File } from "#types/File";

function createFragment({ directives }: GeneratedRule): string {
  return directives
    .map((directive) => {
      return `${formatBlockMarker(markdownBlocks, directive)}\n${endMarker}`;
    })
    .join("\n\n");
}

export async function syncGeneratedRules(config: LoadedConfig) {
  const { resolve, context } = config;

  const [filesystem, agents, resources] = await Promise.all([
    context.filesystem,
    resolve("agents"),
    resolve("resources"),
  ]);

  if (!hasPreferredAgents(agents)) {
    return;
  }

  const [generators, fillers] = await Promise.all([
    context.registry.contributions("agents.rules", config),
    createAgentFillers(config),
  ]);

  const written = new Set<File>();

  for (const { entry, extension } of generators) {
    const generate = await loadLazy(entry);

    const rules = await generate(config, rulesDirectory);

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
  }

  const located = resources.get("agents.generatedRules");

  const owned = located === undefined
    ? []
    : await filesystem.glob(listLocationGlobs(located.location));

  for (const file of owned) {
    if (!written.has(file)) {
      await filesystem.remove(file);
    }
  }
}
