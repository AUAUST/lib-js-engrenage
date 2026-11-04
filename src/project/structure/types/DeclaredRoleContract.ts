import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { RoleReference } from "#project/structure/types/RoleReference";

export interface DeclaredRoleContract extends Omit<
  ResolvedRoleContract,
  "roles"
> {
  readonly roles: readonly RoleReference[] | undefined;
}
