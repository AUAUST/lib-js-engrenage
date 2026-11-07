import type { Role } from "#project/roles/index";
import type { RoleEffects } from "#project/structure/types/RoleEffects";
import type { EffectModules } from "#project/structure/types/EffectModules";

export interface EnvironmentRoles {
  readonly roles: readonly Role[];
  readonly effects: RoleEffects;
  readonly defaultModules?: EffectModules;
  readonly verbatimModuleSyntax: boolean;
}
