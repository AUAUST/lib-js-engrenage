import type { BudgetLevel } from "#tools/agents/metalbrain/types/BudgetLevel";
import type { BudgetWarning } from "#tools/agents/metalbrain/types/BudgetWarning";

/**
 * A subagent's budget: the context of its first call, its level and budget, and
 * the warnings it was given.
 */
export interface BudgetState {
  readonly start: number;
  readonly level: BudgetLevel;
  readonly budget: number;
  readonly warnings: readonly BudgetWarning[];
}
