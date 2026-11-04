import type { DeclaredRoleContract } from "#project/structure/types/DeclaredRoleContract";
import type { RolesOption } from "#project/structure/types/RolesOption";

export interface DeclaredRolesOption extends Omit<RolesOption, "define"> {
  readonly define: Readonly<Record<string, DeclaredRoleContract>>;
}
