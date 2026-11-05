import { values } from "@auaust/toolkit/object";

import { projectMapDirectory } from "#tools/agents/constants";
import { renderProjectMap } from "#tools/agents/utils/renderProjectMap";
import type { Filesystem } from "#foundation/filesystem/index";
import type {
  ImportRule,
  ResolvedAliases,
  ResolvedRoles,
  ResolvedStructure,
} from "#project/structure/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { Globs } from "#types/Globs";

export function syncProjectMap(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  structure: ResolvedStructure;
  aliases: ResolvedAliases;
  importRules: readonly ImportRule[];
  src: { roles: ResolvedRoles };
  scripts: { roles: ResolvedRoles };
  tooling: { roles: ResolvedRoles };
  tests: {
    roles: ResolvedRoles;
    patterns: { plain: Globs; source: Globs; dist: Globs };
  };
}) {
  const { filesystem, structure, tests } = config;

  if (
    (config.agents.preferred?.length ?? 0) === 0 ||
    values(structure).every((environment) => environment === undefined)
  ) {
    return;
  }

  const maps = renderProjectMap({
    structure,
    importRules: config.importRules,
    roles: {
      src: config.src.roles,
      scripts: config.scripts.roles,
      tooling: config.tooling.roles,
      tests: tests.roles,
    },
    aliases: [...config.aliases.global, ...config.aliases.src],
    patterns: tests.patterns,
  });

  for (const { file, content } of maps) {
    filesystem.write(file, content);
  }

  const written = new Set(maps.map(({ file }) => file));

  for (const file of filesystem.glob(`${projectMapDirectory}/*.md`)) {
    if (!written.has(file)) {
      filesystem.remove(file);
    }
  }
}
