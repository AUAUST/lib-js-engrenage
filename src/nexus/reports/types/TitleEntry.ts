import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * A heading for the entries following it.
 */
export interface TitleEntry {
  readonly kind: "title";
  readonly text: ReportText;
}
