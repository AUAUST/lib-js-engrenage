import { stateLevels } from "#batiment/effects/constants";
import type { EffectCeilings } from "#batiment/effects/types/EffectCeilings";
import type { EffectCost } from "#batiment/effects/types/EffectCost";
import type { EffectOperation } from "#batiment/effects/types/EffectOperation";
import type { EffectPosition } from "#batiment/effects/types/EffectPosition";
import type { EffectTarget } from "#batiment/effects/types/EffectTarget";

function levelOf(
  operation: EffectOperation,
  target: EffectTarget,
  position: EffectPosition,
): string | undefined {
  if (!("state" in target)) {
    return operation === "evaluate" ? target.evaluation : target.invocation;
  }

  return operation === "read" || operation === "write"
    ? stateLevels[operation][target.state]?.[position]
    : undefined;
}

/**
 * The level `operation` on `target` costs and the ceiling of `position` it is
 * charged against, or nothing when `ceilings` leave that position unranked or
 * the state `target` names charges nothing there.
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

  if (ceiling === undefined) {
    return;
  }

  const level = levelOf(operation, target, position);

  if (level !== undefined || !("state" in target)) {
    return { level, ceiling };
  }
}
