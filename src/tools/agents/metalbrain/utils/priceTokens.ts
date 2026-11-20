import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";
import type { Prices } from "#tools/agents/metalbrain/types/Prices";

const tokensPerPrice = 1_000_000;

/**
 * The dollar cost of tokens at a tier's prices, given per million tokens.
 */
export function priceTokens(prices: Prices, tokens: MessageTokens): number {
  const dollars = (
    tokens.input * prices.input +
    tokens.cacheWrite5m * prices.cacheWrite5m +
    tokens.cacheWrite1h * prices.cacheWrite1h +
    tokens.cacheRead * prices.cacheRead +
    tokens.output * prices.output
  );

  return dollars / tokensPerPrice;
}
