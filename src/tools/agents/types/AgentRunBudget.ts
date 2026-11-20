import type { BudgetState } from "#tools/agents/metalbrain/index";

export type AgentRunBudget = Pick<BudgetState, "level" | "budget" | "warnings">;
