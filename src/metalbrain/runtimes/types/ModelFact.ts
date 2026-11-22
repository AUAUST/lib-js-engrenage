import type { PriceTier } from "#metalbrain/runtimes/types/PriceTier";

export interface ModelFact {
  readonly family: string;
  readonly aliases: readonly string[];
  readonly contextWindow: number;
  readonly maxOutput: number;
  readonly tiers: readonly PriceTier[];
}
