import type { Filesystem } from "#foundation/filesystem/index";
import type {
  ImportRule,
  ResolvedAliases,
  ResolvedRoles,
  ResolvedStructure,
} from "#project/structure/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { Globs } from "#types/Globs";

export interface ProjectMapSections {
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
}
