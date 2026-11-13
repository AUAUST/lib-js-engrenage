import type { budgetModes } from "#tools/agents/constants";

/**
 * How a budget overrun is reported: `warn` adds it to the agent's context, `deny`
 * blocks the tool call or the stop.
 */
export type BudgetMode = (typeof budgetModes)[number];
