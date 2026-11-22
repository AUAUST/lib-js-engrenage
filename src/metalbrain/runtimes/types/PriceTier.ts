import type { Prices } from "#metalbrain/runtimes/types/Prices";
import type { TierCondition } from "#metalbrain/runtimes/types/TierCondition";

export interface PriceTier {
  readonly name: string;
  readonly condition: TierCondition;
  readonly prices: Prices;
}
