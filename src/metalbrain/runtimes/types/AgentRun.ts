import type { AgentRunBudget } from "#metalbrain/runtimes/types/AgentRunBudget";
import type { AgentTask } from "#metalbrain/runtimes/types/AgentTask";
import type { AgentUsage } from "#metalbrain/runtimes/types/AgentUsage";

export interface AgentRun extends AgentUsage, AgentTask {
  readonly runtime: string;
  readonly session: string;
  readonly agent: string;
  readonly role: string;
  readonly stops: number;
  readonly budget?: AgentRunBudget;
}
