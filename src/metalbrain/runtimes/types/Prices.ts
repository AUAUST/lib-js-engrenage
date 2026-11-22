import type { MessageTokens } from "#metalbrain/runtimes/types/MessageTokens";

/**
 * Dollars per million tokens of each kind.
 */
export type Prices = { readonly [Kind in keyof MessageTokens]: number };
