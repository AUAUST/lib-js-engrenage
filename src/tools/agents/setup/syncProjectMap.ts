import { values } from "@auaust/toolkit/object";

import { testsSection } from "#project/environments/index";
import {
  aliasesSection,
  environmentRolesSection,
  importRulesSection,
  structureSection,
} from "#project/structure/index";
import { agentsSection } from "#tools/agents/config/sections/agentsSection";
import { projectMapDirectory } from "#tools/agents/constants";
import { renderProjectMap } from "#tools/agents/utils/renderProjectMap";
import type { LoadedConfig } from "#project/config/index";

export async function syncProjectMap({ resolve, context }: LoadedConfig) {
  const [filesystem, agents, structure, aliases, importRules, roles, tests] =
    await Promise.all([
      context.filesystem,
      resolve(agentsSection),
      resolve(structureSection),
      resolve(aliasesSection),
      resolve(importRulesSection),
      resolve(environmentRolesSection),
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
      src: roles.src,
      scripts: roles.scripts,
      tooling: roles.tooling,
      tests: roles.tests,
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
