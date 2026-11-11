import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

/** @experimental */
export interface StructureRole {
  readonly contract: ResolvedRoleContract;
  readonly files: Globs;
  readonly ignores: Globs;
}
