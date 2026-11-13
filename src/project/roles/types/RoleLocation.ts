import type { RoleLocationMember } from "#project/roles/types/RoleLocationMember";

/**
 * Where a role applies: its environment, the namespaces and domains enclosing it,
 * outermost first, and the names of the role directories enclosing it, outermost
 * first.
 *
 * @experimental
 */
export interface RoleLocation {
  readonly environment: string;
  readonly lineage: readonly RoleLocationMember[];
  readonly roles: readonly string[];
}
