import type { AgentTokens } from "#tools/agents/types/AgentTokens";
import type { AgentToolResult } from "#tools/agents/types/AgentToolResult";

export interface AgentCall {
  readonly at?: string;
  readonly model: string;
  readonly tier: string;
  readonly tokens: AgentTokens;
  readonly context: number;
  readonly thinking: number;
  readonly results: readonly AgentToolResult[];
}
