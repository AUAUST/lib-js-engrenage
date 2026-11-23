import type { wordCapModes } from "#metalbrain/facts/constants";

/**
 * How a word cap overrun is reported: `warn` adds it to the agent's context,
 * `deny` blocks the tool call or the stop.
 */
export type WordCapMode = (typeof wordCapModes)[number];
