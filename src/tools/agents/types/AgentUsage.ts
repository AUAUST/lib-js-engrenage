import type { AgentTokens } from "#tools/agents/types/AgentTokens";

export interface AgentUsage {
  readonly issue?: string;
  readonly model?: string;
  readonly started?: string;
  readonly ended?: string;
  readonly turns: number;
  readonly tools: Readonly<Record<string, number>>;
  readonly tokens: AgentTokens;
  readonly startContext: number;
  readonly peakContext: number;
}
