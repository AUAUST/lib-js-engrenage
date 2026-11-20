import { measureContext } from "#tools/agents/metalbrain/utils/measureContext";
import type { MessagePrice } from "#tools/agents/metalbrain/types/MessagePrice";
import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";
import type { ModelFacts } from "#tools/agents/metalbrain/types/ModelFacts";
import type { PriceTier } from "#tools/agents/metalbrain/types/PriceTier";

const standardSpeed = "standard";

const tokensPerPrice = 1_000_000;

function countConditions({ condition }: PriceTier): number {
  return Object.values(condition).filter((value) => value !== undefined).length;
}

/**
 * Prices one assistant message: the tier whose condition its `speed` and context
 * meet, the most specific one when several do, and its dollar cost. Returns
 * nothing for a model, or a speed and context, no tier prices.
 */
export function priceMessage(
  facts: ModelFacts,
  message: {
    readonly model: string;
    readonly speed?: string | undefined;
    readonly tokens: MessageTokens;
  },
): MessagePrice | undefined {
  const { model, speed = standardSpeed, tokens } = message;

  const fact = Object.hasOwn(facts.models, model)
    ? facts.models[model]
    : undefined;

  if (fact === undefined) {
    return;
  }

  const context = measureContext(tokens);

  const tier = fact.tiers
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

  if (tier === undefined) {
    return;
  }

  const { prices } = tier;

  const dollars = (
    tokens.input * prices.input +
    tokens.cacheWrite5m * prices.cacheWrite5m +
    tokens.cacheWrite1h * prices.cacheWrite1h +
    tokens.cacheRead * prices.cacheRead +
    tokens.output * prices.output
  );

  return { tier: tier.name, cost: dollars / tokensPerPrice };
}
