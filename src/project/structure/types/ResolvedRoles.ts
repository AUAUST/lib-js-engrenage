import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export interface ResolvedRoles {
  readonly roles: Readonly<Record<string, ResolvedRoleContract>>;
  readonly aliases: Readonly<Record<string, string>>;
}
