import type { RoleLocationMember } from "#batiment/roles/types/RoleLocationMember";

/**
 * Where a role applies: its top-level namespace, the namespaces and domains
 * enclosing it, outermost first, and the names of the role directories enclosing
 * it, outermost first.
 *
 * @experimental
 */
export interface RoleLocation {
  readonly namespace: string;
  readonly lineage: readonly RoleLocationMember[];
  readonly roles: readonly string[];
}
