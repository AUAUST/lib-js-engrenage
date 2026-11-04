import type { RoleDefinition } from "#project/structure/types/RoleDefinition";
import type { RoleReference } from "#project/structure/types/RoleReference";

export interface DeclaredRoleContract extends Omit<RoleDefinition, "roles"> {
  readonly roles: readonly RoleReference[] | undefined;
}
