import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";

/**
 * One line of a `.calls.jsonl` log: a tool call, its output size and the
 * assistant message issuing it, priced in dollars. `tier` and `cost` are `null`
 * for a model the model facts do not price.
 */
export interface ToolCall {
  readonly start?: string;
  readonly end: string;
  readonly duration?: number;
  readonly session: string;
  readonly agent: string;
  readonly role: string;
  readonly tool: string;
  readonly command?: string;
  readonly path?: string;
  readonly pattern?: string;
  readonly exitCode?: number;
  readonly result: {
    readonly characters: number;
    readonly lines: number;
  };
  readonly message?: {
    readonly model: string;
    readonly tier: string | null;
    readonly tokens: MessageTokens;
    readonly context: number;
    readonly contextGain?: number;
    readonly cost: number | null;
  };
}
