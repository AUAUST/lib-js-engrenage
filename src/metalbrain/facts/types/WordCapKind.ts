import type { wordCapKinds } from "#metalbrain/facts/constants";

/**
 * Kind of agent-written text with a word cap.
 */
export type WordCapKind = (typeof wordCapKinds)[number];
