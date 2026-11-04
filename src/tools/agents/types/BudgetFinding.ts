import type { BudgetKind } from "#tools/agents/types/BudgetKind";

export interface BudgetFinding {
  readonly subject: string;
  readonly kind: BudgetKind;
  readonly words: number;
  readonly budget: number;
}
