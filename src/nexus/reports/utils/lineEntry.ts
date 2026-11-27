import type { LineEntry } from "#nexus/reports/types/LineEntry";
import type { ReportData } from "#nexus/reports/types/ReportData";
import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * A line reporting `text` about the `source` its data names, followed
 * by its `fix`.
 *
 * @pure
 */
export function lineEntry(
  text: ReportText,
  { source, fix }: ReportData = {},
): LineEntry {
  return {
    kind: "line",
    text,
    ...(source !== undefined && { source }),
    ...(fix !== undefined && { fix }),
  };
}
