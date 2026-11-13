import type { budgetKinds } from "#tools/agents/constants";

/**
 * Kind of agent-written text with a word budget.
 */
export type BudgetKind = (typeof budgetKinds)[number];
