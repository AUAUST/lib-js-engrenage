import type { wordCapKinds } from "#metalbrain/records/constants";

/**
 * Kind of agent-written text with a word cap.
 */
export type WordCapKind = (typeof wordCapKinds)[number];
