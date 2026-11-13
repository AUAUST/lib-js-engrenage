import type { BudgetKind } from "#tools/agents/types/BudgetKind";
import type { BudgetMode } from "#tools/agents/types/BudgetMode";

/**
 * Word budget of each text kind, with the mode reporting an overrun.
 */
export interface Budgets extends Readonly<Record<BudgetKind, number>> {
  readonly mode: BudgetMode;
}
