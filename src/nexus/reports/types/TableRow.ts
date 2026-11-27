import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * A table row: its cells, one per column, and how deep its first cell nests under
 * the rows above it, `0` when absent.
 */
export interface TableRow {
  readonly cells: readonly ReportText[];
  readonly depth?: number;
}
