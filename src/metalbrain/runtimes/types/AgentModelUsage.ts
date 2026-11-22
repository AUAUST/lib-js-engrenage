import type { AgentTokens } from "#metalbrain/runtimes/types/AgentTokens";

export interface AgentModelUsage {
  readonly model: string;
  readonly tier: string;
  readonly calls: number;
  readonly tokens: AgentTokens;
}
