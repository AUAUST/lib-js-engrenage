import type { budgetModes } from "#metalbrain/records/constants";

/**
 * How a budget overrun is reported: `warn` adds it to the agent's context, `deny`
 * blocks the tool call or the stop.
 */
export type BudgetMode = (typeof budgetModes)[number];
