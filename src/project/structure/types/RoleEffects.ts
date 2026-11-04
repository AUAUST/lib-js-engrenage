import type { EffectModules } from "#project/structure/types/EffectModules";

export interface RoleEffects {
  readonly levels: readonly string[] | undefined;
  readonly modules: EffectModules | undefined;
  readonly fallback: string | undefined;
}
