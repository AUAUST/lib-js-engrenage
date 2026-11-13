import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

/**
 * A role of an environment: its contract and the files it covers, minus the files
 * it ignores.
 *
 * @experimental
 */
export interface StructureRole {
  readonly contract: ResolvedRoleContract;
  readonly files: Globs;
  readonly ignores: Globs;
}
