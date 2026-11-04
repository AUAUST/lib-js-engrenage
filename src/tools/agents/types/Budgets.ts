import type { BudgetKind } from "#tools/agents/types/BudgetKind";
import type { BudgetMode } from "#tools/agents/types/BudgetMode";

export interface Budgets extends Readonly<Record<BudgetKind, number>> {
  readonly mode: BudgetMode;
}
