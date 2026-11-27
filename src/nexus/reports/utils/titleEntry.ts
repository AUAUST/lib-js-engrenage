import type { ReportText } from "#nexus/reports/types/ReportText";
import type { TitleEntry } from "#nexus/reports/types/TitleEntry";

/**
 * A heading for the entries reported after it.
 *
 * @pure
 */
export function titleEntry(text: ReportText): TitleEntry {
  return { kind: "title", text };
}
