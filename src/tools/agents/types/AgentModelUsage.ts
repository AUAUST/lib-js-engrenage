import type { AgentTokens } from "#tools/agents/types/AgentTokens";

export interface AgentModelUsage {
  readonly model: string;
  readonly tier: string;
  readonly tokens: AgentTokens;
}
