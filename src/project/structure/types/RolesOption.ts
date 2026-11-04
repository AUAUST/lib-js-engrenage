import type { ResolvedRoleContract } from "#structure/types/ResolvedRoleContract";
import type { RoleKey } from "#structure/types/RoleKey";

export interface RolesOption {
  readonly enable: readonly RoleKey[];
  readonly disable: readonly RoleKey[];
  readonly define: Readonly<Record<string, ResolvedRoleContract>>;
  readonly aliases: Readonly<Record<string, string>>;
}
