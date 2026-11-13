import type { BudgetKind } from "#tools/agents/types/BudgetKind";

/**
 * A `## ` section of an agent-written text whose word count exceeds the budget
 * of its kind; `subject` is the section heading.
 */
export interface BudgetFinding {
  readonly subject: string;
  readonly kind: BudgetKind;
  readonly words: number;
  readonly budget: number;
}
