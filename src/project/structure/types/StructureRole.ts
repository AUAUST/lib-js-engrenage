import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

export interface StructureRole {
  readonly contract: ResolvedRoleContract;
  readonly files: Globs;
  readonly ignores: Globs;
}
