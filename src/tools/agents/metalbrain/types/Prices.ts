import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";

/**
 * Dollars per million tokens of each kind.
 */
export type Prices = { readonly [Kind in keyof MessageTokens]: number };
