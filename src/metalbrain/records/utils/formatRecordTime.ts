/**
 * `date` as a record time: UTC ISO 8601 to the second, as `created` and
 * taps write it.
 */
export function formatRecordTime(date: Date): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}
