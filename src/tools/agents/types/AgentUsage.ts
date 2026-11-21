import type { AgentCacheLoss } from "#tools/agents/types/AgentCacheLoss";
import type { AgentCallGaps } from "#tools/agents/types/AgentCallGaps";
import type { AgentCompaction } from "#tools/agents/types/AgentCompaction";
import type { AgentLargestResult } from "#tools/agents/types/AgentLargestResult";
import type { AgentModelUsage } from "#tools/agents/types/AgentModelUsage";
import type { AgentResultTotals } from "#tools/agents/types/AgentResultTotals";

export interface AgentUsage {
  readonly started?: string;
  readonly ended?: string;
  // @debt `turns` counts API calls, not user turns, and `AgentRun.stops` counts stop events: names that mislead readers of the stats
  readonly turns: number;
  readonly tools: Readonly<Record<string, number>>;
  readonly models: readonly AgentModelUsage[];
  readonly startContext: number;
  readonly peakContext: number;
  readonly results?: Readonly<Record<string, AgentResultTotals>>;
  readonly largestResults?: readonly AgentLargestResult[];
  readonly thinking?: number;
  readonly batched?: number;
  readonly gaps?: AgentCallGaps;
  readonly ttl5m?: AgentCacheLoss;
  readonly misses?: AgentCacheLoss;
  readonly compactions?: readonly AgentCompaction[];
}
