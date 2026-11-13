import type { AgentUsage } from "#tools/agents/types/AgentUsage";

export interface AgentRun extends AgentUsage {
  readonly runtime: string;
  readonly session: string;
  readonly agent: string;
  readonly role: string;
  readonly stops: number;
}
