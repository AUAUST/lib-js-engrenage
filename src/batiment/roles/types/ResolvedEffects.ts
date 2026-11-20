import type { EffectModules } from "#batiment/roles/types/EffectModules";

export interface ResolvedEffects {
  readonly levels: readonly string[];
  readonly modules: readonly EffectModules[];
  readonly fallback: string | undefined;
}
