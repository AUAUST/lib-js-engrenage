import type { RoleContract } from "#project/structure/types/RoleContract";

export interface ResolvedRoles {
  readonly roles: Readonly<Record<string, RoleContract>>;
  readonly aliases: Readonly<Record<string, string>>;
}
