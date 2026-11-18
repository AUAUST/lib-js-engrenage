import type { AgentDispatch } from "#tools/agents/types/AgentDispatch";
import type { AgentReport } from "#tools/agents/types/AgentReport";

/**
 * Runs an agent headless through a runtime's own client, blocking until
 * the run ends.
 */
export type AgentDispatcher = (dispatch: AgentDispatch) => Promise<AgentReport>;
