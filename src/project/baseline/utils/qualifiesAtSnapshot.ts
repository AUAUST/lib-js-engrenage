import { baselineWidelyAvailableMonths } from "#project/baseline/constants";
import { addMonths } from "#project/baseline/utils/addMonths";

export function qualifiesAtSnapshot(
  date: string | null,
  snapshot: string,
): boolean {
  return (
    date !== null &&
    addMonths(date, baselineWidelyAvailableMonths) <= `${snapshot}-01`
  );
}
