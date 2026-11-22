import type { AgentRunBudget, AgentUsage } from "#metalbrain/runtimes/index";
import type { AgentTask } from "#tools/agents/types/AgentTask";

export interface AgentRun extends AgentUsage, AgentTask {
  readonly runtime: string;
  readonly session: string;
  readonly agent: string;
  readonly role: string;
  readonly stops: number;
  readonly budget?: AgentRunBudget;
}
