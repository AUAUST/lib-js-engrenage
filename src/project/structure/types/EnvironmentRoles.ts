import type { Role } from "#project/roles/index";
import type { EffectModules } from "#project/structure/types/EffectModules";
import type { RoleEffects } from "#project/structure/types/RoleEffects";

export interface EnvironmentRoles {
  readonly roles: readonly Role[];
  readonly effects: RoleEffects;
  readonly defaultModules?: EffectModules;
  readonly verbatimModuleSyntax: boolean;
}
