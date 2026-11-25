const legacyRecordIdPattern = /^\d{6}-[\da-f]{4}$/u;

/**
 * Whether `value` has the form of an entry ID from before IDs named their kind:
 * the creation day as `YYMMDD`, a dash, then 4 lowercase hex characters.
 */
export function isLegacyRecordId(value: string): boolean {
  return legacyRecordIdPattern.test(value);
}
