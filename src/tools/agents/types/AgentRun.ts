import type { AgentRunBudget } from "#tools/agents/types/AgentRunBudget";
import type { AgentTask } from "#tools/agents/types/AgentTask";
import type { AgentUsage } from "#tools/agents/types/AgentUsage";

export interface AgentRun extends AgentUsage, AgentTask {
  readonly runtime: string;
  readonly session: string;
  readonly agent: string;
  readonly role: string;
  readonly stops: number;
  readonly budget?: AgentRunBudget;
}
