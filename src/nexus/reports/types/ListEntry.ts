import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * Items reported one after another.
 */
export interface ListEntry {
  readonly kind: "list";
  readonly items: readonly ReportText[];
}
