import type { AgentCall } from "#tools/agents/types/AgentCall";
import type { AgentCompaction } from "#tools/agents/types/AgentCompaction";

export interface AgentTranscript {
  readonly calls: readonly AgentCall[];
  readonly compactions: readonly AgentCompaction[];
  /**
   * The text of the first user message.
   */
  readonly brief?: string;
  /**
   * The text the agent ended on, when its last content is a report rather
   * than a tool call.
   */
  readonly report?: string;
  readonly started?: string;
  readonly ended?: string;
}
