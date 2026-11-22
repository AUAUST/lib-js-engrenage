import type { AgentDispatch } from "#metalbrain/runtimes/types/AgentDispatch";
import type { AgentReport } from "#metalbrain/runtimes/types/AgentReport";

/**
 * Runs an agent headless through a runtime's own client, blocking until
 * the run ends.
 */
export type AgentDispatcher = (dispatch: AgentDispatch) => Promise<AgentReport>;
