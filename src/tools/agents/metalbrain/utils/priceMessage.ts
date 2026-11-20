import { findModelFact } from "#tools/agents/metalbrain/utils/findModelFact";
import { findPriceTier } from "#tools/agents/metalbrain/utils/findPriceTier";
import { measureContext } from "#tools/agents/metalbrain/utils/measureContext";
import { priceTokens } from "#tools/agents/metalbrain/utils/priceTokens";
import type { MessagePrice } from "#tools/agents/metalbrain/types/MessagePrice";
import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";
import type { ModelFacts } from "#tools/agents/metalbrain/types/ModelFacts";

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
