const recordIdPattern = /^\d{6}-[\da-f]{4}$/u;

/**
 * Whether `value` has a record entry ID's form: the creation day as `YYMMDD`, a
 * dash, then 4 lowercase hex characters.
 */
export function isRecordId(value: string): boolean {
  return recordIdPattern.test(value);
}
