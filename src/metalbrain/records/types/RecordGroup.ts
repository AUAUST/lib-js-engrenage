import type { readRecordGroups } from "#metalbrain/records/operations/readRecordGroups";

/**
 * A record group file: the error parsing it, or its schema issues, its purpose
 * and its entries, each valid or holding its issues.
 */
export type RecordGroup = Awaited<ReturnType<typeof readRecordGroups>>[number];
