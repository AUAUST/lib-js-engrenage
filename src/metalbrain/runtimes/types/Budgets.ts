import type { BudgetLevel } from "#metalbrain/runtimes/types/BudgetLevel";

/**
 * The token budget of each budget level: the context an agent may gain over its
 * first call before it is warned.
 */
export interface Budgets {
  readonly levels: Readonly<Record<BudgetLevel, number>>;
}
