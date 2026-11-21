import type { plannerModes } from "#tools/agents/constants";

/**
 * The mode a dispatched planner is briefed in.
 */
export type PlannerMode = (typeof plannerModes)[number];
