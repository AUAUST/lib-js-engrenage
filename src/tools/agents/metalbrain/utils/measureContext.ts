import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";

/**
 * The context a message was sent with: every input token, cached or not.
 */
export function measureContext(tokens: MessageTokens): number {
  return (
    tokens.input + tokens.cacheRead + tokens.cacheWrite5m + tokens.cacheWrite1h
  );
}
