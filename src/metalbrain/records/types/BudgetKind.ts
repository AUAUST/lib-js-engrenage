import type { budgetKinds } from "#metalbrain/records/constants";

/**
 * Kind of agent-written text with a word budget.
 */
export type BudgetKind = (typeof budgetKinds)[number];
