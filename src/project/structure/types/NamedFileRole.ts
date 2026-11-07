import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

export interface NamedFileRole {
  readonly name: string;
  readonly contract: ResolvedRoleContract;
  readonly globs: Globs;
}
