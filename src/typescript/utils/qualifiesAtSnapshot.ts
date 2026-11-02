import { baselineWidelyAvailableMonths } from "#typescript/constants";
import { addMonths } from "#typescript/utils/addMonths";

export function qualifiesAtSnapshot(
  date: string | null,
  snapshot: string,
): boolean {
  return (
    date !== null &&
    addMonths(date, baselineWidelyAvailableMonths) <= `${snapshot}-01`
  );
}
