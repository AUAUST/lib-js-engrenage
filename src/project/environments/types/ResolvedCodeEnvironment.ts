import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { ResolvedEnvironmentTsconfig } from "#project/tsconfig/types/ResolvedEnvironmentTsconfig";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface ResolvedCodeEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
  readonly generated: Globs;
  readonly discovered: Globs;
  readonly defines: boolean;
  readonly globs: Globs;
  readonly roles: ResolvedRoles;
  readonly tsconfig: ResolvedEnvironmentTsconfig;
}
