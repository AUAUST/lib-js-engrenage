import type { BudgetLevel } from "#metalbrain/runtimes/types/BudgetLevel";

// @debt shares its name with the word `Budgets` of `metalbrain/records`, a different concept; naming this one after token budgets would tell them apart
/**
 * The token budget of each budget level: the context an agent may gain over its
 * first call before it is warned.
 */
export interface Budgets {
  readonly levels: Readonly<Record<BudgetLevel, number>>;
}
