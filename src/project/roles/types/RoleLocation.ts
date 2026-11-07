import type { RoleLocationMember } from "#project/roles/types/RoleLocationMember";

export interface RoleLocation {
  // @debt typed as a string since `project/roles` cannot import `RoleEnvironment` from `project/structure`; the environment names belong in the lowest domain that needs them
  readonly environment: string;
  readonly lineage: readonly RoleLocationMember[];
  readonly roles: readonly string[];
}
