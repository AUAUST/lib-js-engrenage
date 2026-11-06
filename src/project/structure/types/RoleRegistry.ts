import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export interface RoleRegistry {
  readonly contracts: Record<string, ResolvedRoleContract>;
  readonly aliases: Record<string, string>;
}
