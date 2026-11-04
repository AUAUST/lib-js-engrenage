import type { RoleDefinition } from "#project/structure/types/RoleDefinition";
import type { RoleKey } from "#project/structure/types/RoleKey";

export interface RolesOption {
  readonly enable: readonly RoleKey[];
  readonly disable: readonly RoleKey[];
  readonly define: Readonly<Record<string, RoleDefinition>>;
  readonly aliases: Readonly<Record<string, string>>;
}
