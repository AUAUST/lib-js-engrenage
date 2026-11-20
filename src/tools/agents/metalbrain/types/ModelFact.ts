import type { PriceTier } from "#tools/agents/metalbrain/types/PriceTier";

export interface ModelFact {
  readonly family: string;
  readonly contextWindow: number;
  readonly maxOutput: number;
  readonly tiers: readonly PriceTier[];
}
