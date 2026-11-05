import { values } from "@auaust/toolkit/object";

import {
  aliasesSection,
  importRulesSection,
  scriptsSection,
  sourceSection,
  structureSection,
  testsSection,
  toolingSection,
  type LoadedConfig,
} from "#project/config/index";
import { projectMapDirectory } from "#tools/agents/constants";
import { agentsSection } from "#tools/agents/operations/agentsSection";
import { renderProjectMap } from "#tools/agents/utils/renderProjectMap";

export async function syncProjectMap({ resolve, context }: LoadedConfig) {
  const [
    filesystem,
    agents,
    structure,
    aliases,
    importRules,
    source,
    scripts,
    tooling,
    tests,
  ] = await Promise.all([
    context.filesystem,
    resolve(agentsSection),
    resolve(structureSection),
    resolve(aliasesSection),
    resolve(importRulesSection),
    resolve(sourceSection),
    resolve(scriptsSection),
    resolve(toolingSection),
    resolve(testsSection),
  ]);

  if (
    (agents.preferred?.length ?? 0) === 0 ||
    values(structure).every((environment) => environment === undefined)
  ) {
    return;
  }

  const maps = renderProjectMap({
    structure,
    importRules,
    roles: {
      src: source.roles,
      scripts: scripts.roles,
      tooling: tooling.roles,
      tests: tests.roles,
    },
    aliases: [...aliases.global, ...aliases.src],
    patterns: tests.patterns,
  });

  await Promise.all(
    maps.map(({ file, content }) => filesystem.write(file, content)),
  );

  const written = new Set(maps.map(({ file }) => file));

  for (const file of await filesystem.glob(`${projectMapDirectory}/*.md`)) {
    if (!written.has(file)) {
      await filesystem.remove(file);
    }
  }
}
