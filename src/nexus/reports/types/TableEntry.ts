import type { ReportText } from "#nexus/reports/types/ReportText";
import type { TableColumn } from "#nexus/reports/types/TableColumn";
import type { TableRow } from "#nexus/reports/types/TableRow";

/**
 * Rows of cells aligned in columns, under their `title`.
 */
export interface TableEntry {
  readonly kind: "table";
  readonly title?: ReportText;
  readonly columns: readonly TableColumn[];
  readonly rows: readonly TableRow[];
}
