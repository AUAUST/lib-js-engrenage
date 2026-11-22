import type { BudgetState } from "#metalbrain/runtimes/types/BudgetState";

export type AgentRunBudget = Pick<BudgetState, "level" | "budget" | "warnings">;
