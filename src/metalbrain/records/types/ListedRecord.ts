import type { listRecords } from "#metalbrain/records/operations/listRecords";

/**
 * A record entry as `listRecords` lists it: its group, and its keys in the
 * order its kind writes them.
 */
export type ListedRecord = Awaited<ReturnType<typeof listRecords>>[number];
