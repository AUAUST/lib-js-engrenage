import { baselineWidelyAvailableMonths } from "#baseline/constants";
import { addMonths } from "#baseline/utils/addMonths";

export function qualifiesAtSnapshot(
  date: string | null,
  snapshot: string,
): boolean {
  return (
    date !== null &&
    addMonths(date, baselineWidelyAvailableMonths) <= `${snapshot}-01`
  );
}
