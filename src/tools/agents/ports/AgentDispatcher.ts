import type { AgentReport } from "#metalbrain/runtimes/index";
import type { AgentDispatch } from "#tools/agents/types/AgentDispatch";

/**
 * Runs an agent headless through a runtime's own client, blocking until
 * the run ends.
 */
export type AgentDispatcher = (dispatch: AgentDispatch) => Promise<AgentReport>;
