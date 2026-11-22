import type { readRecordDocument } from "#metalbrain/records/operations/readRecordDocument";

/**
 * A record group file read as an editable YAML document, with its `entries` list.
 */
export type RecordDocument = Awaited<ReturnType<typeof readRecordDocument>>;
