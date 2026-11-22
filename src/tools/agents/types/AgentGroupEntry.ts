import type { AgentModelUsage } from "#metalbrain/runtimes/index";
import type { AgentRun } from "#tools/agents/types/AgentRun";

/**
 * A run's usage counted under one group of an aggregate table.
 */
export interface AgentGroupEntry {
  readonly run: AgentRun;
  readonly group: string;
  readonly usage: readonly AgentModelUsage[];
}
