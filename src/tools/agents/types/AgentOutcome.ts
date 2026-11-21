import type { agentOutcomes } from "#tools/agents/constants";

/**
 * How a subagent handed back, read from the opening of its final report:
 * `unreported` when its transcript ends without one.
 */
export type AgentOutcome = (typeof agentOutcomes)[number];
