import type { ResolvedRoleContract } from "#batiment/roles/index";
import type { Globs } from "#types/Globs";

/**
 * A role of an environment: its contract and the files it covers, minus
 * the files it ignores.
 *
 * @experimental
 */
export interface StructureRole {
  readonly contract: ResolvedRoleContract;
  readonly files: Globs;
  readonly ignores: Globs;
}
