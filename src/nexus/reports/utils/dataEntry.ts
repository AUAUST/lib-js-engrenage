import type { DataEntry } from "#nexus/reports/types/DataEntry";
import type { ReportContent } from "#nexus/reports/types/ReportContent";

/**
 * A result stating `value` for machines, read through `entries` otherwise.
 *
 * @pure
 */
export function dataEntry(
  value: unknown,
  entries: readonly ReportContent[],
): DataEntry {
  return {
    kind: "data",
    value,
    entries,
  };
}
