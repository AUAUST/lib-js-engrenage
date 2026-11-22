const backlogIdPattern = /^\d{8}-[\da-f]{4}$/u;

/**
 * Whether `value` has a backlog entry ID's form: the creation day as `YYYYMMDD`,
 * a dash, then 4 lowercase hex characters.
 */
export function isBacklogId(value: string): boolean {
  return backlogIdPattern.test(value);
}
