import type { AgentModelUsage } from "#tools/agents/types/AgentModelUsage";

export interface AgentUsage {
  readonly issue?: string;
  readonly started?: string;
  readonly ended?: string;
  // @debt `turns` counts API calls, not user turns, and `AgentRun.stops` counts stop events: names that mislead readers of the stats
  readonly turns: number;
  readonly tools: Readonly<Record<string, number>>;
  readonly models: readonly AgentModelUsage[];
  readonly startContext: number;
  readonly peakContext: number;
}
