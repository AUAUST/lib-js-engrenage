import type { AgentCall } from "#tools/agents/types/AgentCall";
import type { AgentCompaction } from "#tools/agents/types/AgentCompaction";

export interface AgentTranscript {
  readonly calls: readonly AgentCall[];
  readonly compactions: readonly AgentCompaction[];
  readonly issue?: string;
  readonly started?: string;
  readonly ended?: string;
}
