import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";

/**
 * One assistant message of a transcript, with the context it was sent with.
 */
export interface AssistantMessage {
  readonly id: string;
  readonly model: string;
  readonly speed?: string;
  readonly tokens: MessageTokens;
  readonly context: number;
}
