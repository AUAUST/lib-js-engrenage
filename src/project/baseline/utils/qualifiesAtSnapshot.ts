import { baselineWidelyAvailableMonths } from "#project/baseline/constants";
import { addMonths } from "#project/baseline/utils/addMonths";

/**
 * Whether a feature newly available on `date` is widely available, 30 months
 * later, by the first day of `snapshot`; `false` for a `null` date, a feature
 * never available.
 */
export function qualifiesAtSnapshot(
  date: string | null,
  snapshot: string,
): boolean {
  return (
    date !== null &&
    addMonths(date, baselineWidelyAvailableMonths) <= `${snapshot}-01`
  );
}
