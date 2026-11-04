import type { Trait } from "#project/presets/types/Trait";

export interface ResolvedTraitAdjustments {
  readonly enable: readonly Trait[];
  readonly disable: readonly Trait[];
}
