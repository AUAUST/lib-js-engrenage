import { parseRecordId } from "#metalbrain/records/utils/parseRecordId";

/**
 * Whether `value` has a record entry ID's form, as `parseRecordId` reads it.
 */
export function isRecordId(value: string): boolean {
  return parseRecordId(value) !== undefined;
}
