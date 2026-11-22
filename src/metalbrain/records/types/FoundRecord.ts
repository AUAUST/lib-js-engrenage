import type { findRecord } from "#metalbrain/records/operations/findRecord";

/**
 * A record entry found by its ID: its group, its group file as an editable
 * document, its position in the `entries` list and its keys.
 */
export type FoundRecord = Awaited<ReturnType<typeof findRecord>>;
