import type { EffectHint } from "#tools/eslint/effects/types/EffectHint";
import type { RankedUnit } from "#tools/eslint/effects/types/RankedUnit";

/**
 * A ranked unit as an access to `binding` charges it, `hint` naming why lint
 * cannot prove that charge, `undefined` when the code proves it.
 */
export interface HintedUnit extends RankedUnit {
  binding: string;
  hint: EffectHint | undefined;
}
