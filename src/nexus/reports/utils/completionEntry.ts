import type { CompletionEntry } from "#nexus/reports/types/CompletionEntry";
import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * The completion line stating `text` as the command's outcome, with the run's
 * total `duration` in milliseconds when known.
 *
 * @pure
 */
export function completionEntry(
  text: ReportText,
  duration?: number,
): CompletionEntry {
  return {
    kind: "completion",
    text,
    ...(duration !== undefined && { duration }),
  };
}
