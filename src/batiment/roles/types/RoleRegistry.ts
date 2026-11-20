import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";

export interface RoleRegistry {
  readonly contracts: Record<string, ResolvedRoleContract>;
  readonly aliases: Record<string, string>;
}
