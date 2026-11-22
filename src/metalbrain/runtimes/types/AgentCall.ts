import type { AgentTokens } from "#metalbrain/runtimes/types/AgentTokens";
import type { AgentToolResult } from "#metalbrain/runtimes/types/AgentToolResult";

export interface AgentCall {
  readonly at?: string;
  readonly model: string;
  readonly tier: string;
  readonly tokens: AgentTokens;
  readonly context: number;
  readonly thinking: number;
  readonly results: readonly AgentToolResult[];
}
