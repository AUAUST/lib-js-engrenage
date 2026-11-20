import type { ModelFact } from "#tools/agents/metalbrain/types/ModelFact";

/**
 * The model facts file: each model's limits and price tiers, the URLs they come
 * from and the date they were read.
 */
export interface ModelFacts {
  readonly read: string;
  readonly source: Readonly<Record<string, string>>;
  readonly models: Readonly<Record<string, ModelFact>>;
}
