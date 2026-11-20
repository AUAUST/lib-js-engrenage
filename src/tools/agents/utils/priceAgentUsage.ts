import {
  findModelFact,
  priceTokens,
  type ModelFacts,
} from "#tools/agents/metalbrain/index";
import type { AgentModelUsage } from "#tools/agents/types/AgentModelUsage";
import type { AgentPrice } from "#tools/agents/types/AgentPrice";

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
