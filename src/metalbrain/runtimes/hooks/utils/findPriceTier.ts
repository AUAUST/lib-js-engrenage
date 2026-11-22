import type { ModelFact } from "#metalbrain/runtimes/types/ModelFact";
import type { PriceTier } from "#metalbrain/runtimes/types/PriceTier";

const standardSpeed = "standard";

function countConditions({ condition }: PriceTier): number {
  return Object.values(condition).filter((value) => value !== undefined).length;
}

/**
 * The tier of a model whose condition a call's `speed` and context meet, the
 * most specific one when several do.
 */
export function findPriceTier(
  fact: ModelFact,
  call: { readonly speed?: string | undefined; readonly context: number },
): PriceTier | undefined {
  const { speed = standardSpeed, context } = call;

  return fact.tiers
    .filter(({ condition }) => {
      return (
        (condition.speed ?? standardSpeed) === speed &&
        (condition.contextAbove === undefined ||
          context > condition.contextAbove)
      );
    })
    .reduce<PriceTier | undefined>((chosen, candidate) => {
      return chosen === undefined ||
        countConditions(candidate) > countConditions(chosen)
        ? candidate
        : chosen;
    }, undefined);
}
