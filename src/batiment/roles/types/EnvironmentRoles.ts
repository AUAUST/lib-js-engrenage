import type { EffectModules } from "#batiment/roles/types/EffectModules";
import type { Role } from "#batiment/roles/types/Role";
import type { RoleEffects } from "#batiment/roles/types/RoleEffects";

export interface EnvironmentRoles {
  readonly roles: readonly Role[];
  readonly effects: RoleEffects;
  readonly defaultModules?: EffectModules;
  readonly verbatimModuleSyntax: boolean;
  readonly published: boolean;
}
