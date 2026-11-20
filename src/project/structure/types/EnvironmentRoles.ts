import type { Role } from "#batiment/roles/index";
import type { EffectModules } from "#project/structure/types/EffectModules";
import type { RoleEffects } from "#project/structure/types/RoleEffects";

export interface EnvironmentRoles {
  readonly roles: readonly Role[];
  readonly effects: RoleEffects;
  readonly defaultModules?: EffectModules;
  readonly verbatimModuleSyntax: boolean;
  readonly published: boolean;
}
