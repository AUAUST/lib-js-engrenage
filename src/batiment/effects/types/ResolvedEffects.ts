import type { EffectRanks } from "#batiment/effects/types/EffectRanks";

export interface ResolvedEffects {
  readonly levels: readonly string[];
  readonly purposes: Readonly<Record<string, string>>;
  readonly ranks: readonly EffectRanks[];
  readonly fallback: string | undefined;
}
