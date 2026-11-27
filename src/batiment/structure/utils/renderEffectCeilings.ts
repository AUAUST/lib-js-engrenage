import type { EffectCeilings } from "#batiment/effects/index";

/**
 * The ceilings as one level where they match, else each stated one by its
 * position; `undefined` when neither is stated.
 */
export function renderEffectCeilings({
  evaluation,
  invocation,
}: EffectCeilings): string | undefined {
  if (evaluation === invocation) {
    return evaluation;
  }

  return [
    evaluation === undefined ? undefined : `evaluation ${evaluation}`,
    invocation === undefined ? undefined : `invocation ${invocation}`,
  ]
    .filter((part) => part !== undefined)
    .join(", ");
}
