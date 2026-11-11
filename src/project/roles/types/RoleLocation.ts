import type { RoleLocationMember } from "#project/roles/types/RoleLocationMember";

/** @experimental */
export interface RoleLocation {
  readonly environment: string;
  readonly lineage: readonly RoleLocationMember[];
  readonly roles: readonly string[];
}
