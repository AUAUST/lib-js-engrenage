import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * Text reported as it reads, about the file or option `source` names, followed
 * by the `fix` resolving the problem it reports.
 */
export interface LineEntry {
  readonly kind: "line";
  readonly text: ReportText;
  readonly source?: string;
  readonly fix?: ReportText;
}
