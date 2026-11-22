import type { BudgetKind } from "#metalbrain/records/types/BudgetKind";
import type { BudgetMode } from "#metalbrain/records/types/BudgetMode";

/**
 * Word budget of each text kind, with the mode reporting an overrun.
 */
export interface Budgets extends Readonly<Record<BudgetKind, number>> {
  readonly mode: BudgetMode;
}
