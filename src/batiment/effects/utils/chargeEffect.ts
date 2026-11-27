import type { EffectCeilings } from "#batiment/effects/types/EffectCeilings";
import type { EffectCost } from "#batiment/effects/types/EffectCost";
import type { EffectOperation } from "#batiment/effects/types/EffectOperation";
import type { EffectPosition } from "#batiment/effects/types/EffectPosition";
import type { EffectTarget } from "#batiment/effects/types/EffectTarget";

/**
 * The level `operation` on `target` costs and the ceiling of `position` it is
 * charged against, or nothing when `ceilings` leave that position unranked.
 */
export function chargeEffect({
  operation,
  target,
  position,
  ceilings,
}: {
  operation: EffectOperation;
  target: EffectTarget;
  position: EffectPosition;
  ceilings: EffectCeilings;
}): EffectCost | undefined {
  const ceiling = ceilings[position];

  if (ceiling !== undefined) {
    return {
      level: operation === "evaluate" ? target.evaluation : target.invocation,
      ceiling,
    };
  }
}
