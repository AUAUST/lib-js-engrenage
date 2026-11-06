import type { Role } from "#project/roles/index";
import type { RoleEffects } from "#project/structure/types/RoleEffects";

export interface EnvironmentRoles {
  readonly roles: readonly Role[];
  readonly effects: RoleEffects;
  readonly verbatimModuleSyntax: boolean;
}
