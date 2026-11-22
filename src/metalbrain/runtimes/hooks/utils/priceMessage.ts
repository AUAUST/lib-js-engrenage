import { findModelFact } from "#metalbrain/runtimes/hooks/utils/findModelFact";
import { findPriceTier } from "#metalbrain/runtimes/hooks/utils/findPriceTier";
import { measureContext } from "#metalbrain/runtimes/hooks/utils/measureContext";
import { priceTokens } from "#metalbrain/runtimes/hooks/utils/priceTokens";
import type { MessagePrice } from "#metalbrain/runtimes/types/MessagePrice";
import type { MessageTokens } from "#metalbrain/runtimes/types/MessageTokens";
import type { ModelFacts } from "#metalbrain/runtimes/types/ModelFacts";

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
  const { model, speed, tokens } = message;

  const fact = findModelFact(facts, model);

  const tier = fact === undefined
    ? undefined
    : findPriceTier(fact, { speed, context: measureContext(tokens) });

  return tier === undefined
    ? undefined
    : { tier: tier.name, cost: priceTokens(tier.prices, tokens) };
}
