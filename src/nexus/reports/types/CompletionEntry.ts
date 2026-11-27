import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * The command's one-line outcome, with the run's total time in milliseconds
 * once its run reports it.
 */
export interface CompletionEntry {
  readonly kind: "completion";
  readonly text: ReportText;
  readonly duration?: number;
}
