import type { Prices } from "#tools/agents/metalbrain/types/Prices";
import type { TierCondition } from "#tools/agents/metalbrain/types/TierCondition";

export interface PriceTier {
  readonly name: string;
  readonly condition: TierCondition;
  readonly prices: Prices;
}
