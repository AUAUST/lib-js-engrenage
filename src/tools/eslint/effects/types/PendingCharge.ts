import type { EffectCharge } from "#tools/eslint/effects/types/EffectCharge";

/**
 * A charge collected before the position running it is known.
 */
export type PendingCharge = Omit<
  EffectCharge,
  "position" | "through" | "declared"
>;
