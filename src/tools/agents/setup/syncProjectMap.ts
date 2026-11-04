import { values } from "@auaust/toolkit/object";

import { projectMapFile } from "#tools/agents/constants";
import { renderProjectMap } from "#tools/agents/utils/renderProjectMap";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedStructure } from "#project/config/types/ResolvedStructure";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { TestsLayout } from "#project/structure/types/TestsLayout";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { Globs } from "#types/Globs";

export function syncProjectMap(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  structure: ResolvedStructure;
  importRules: readonly ImportRule[];
  src: { roles: ResolvedRoles };
  scripts: { roles: ResolvedRoles };
  tooling: { roles: ResolvedRoles };
  tests: {
    roles: ResolvedRoles;
    layout: TestsLayout;
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

  filesystem.write(
    projectMapFile,
    renderProjectMap({
      structure,
      importRules: config.importRules,
      roles: {
        src: config.src.roles,
        scripts: config.scripts.roles,
        tooling: config.tooling.roles,
        tests: tests.roles,
      },
      tests,
    }),
  );
}
