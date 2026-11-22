import { findModelFact, priceTokens } from "#metalbrain/runtimes/hooks/index";
import type { AgentModelUsage } from "#metalbrain/runtimes/types/AgentModelUsage";
import type { AgentPrice } from "#metalbrain/runtimes/types/AgentPrice";
import type { ModelFacts } from "#metalbrain/runtimes/types/ModelFacts";

export function priceAgentUsage(
  facts: ModelFacts,
  entries: readonly AgentModelUsage[],
): AgentPrice {
  return entries.reduce<AgentPrice>(
    ({ cost, unpriced }, { model, tier, tokens }) => {
      const prices = findModelFact(facts, model)?.tiers.find(({ name }) => {
        return name === tier;
      })?.prices;

      return prices === undefined
        ? {
            cost,
            unpriced: unpriced.includes(model)
              ? unpriced
              : [...unpriced, model],
          }
        : { cost: cost + priceTokens(prices, tokens), unpriced };
    },
    { cost: 0, unpriced: [] },
  );
}
