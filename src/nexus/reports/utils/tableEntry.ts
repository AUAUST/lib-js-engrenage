import type { ReportText } from "#nexus/reports/types/ReportText";
import type { TableColumn } from "#nexus/reports/types/TableColumn";
import type { TableEntry } from "#nexus/reports/types/TableEntry";
import type { TableRow } from "#nexus/reports/types/TableRow";

/**
 * A table aligning the cells of `rows` in `columns`, under its `title`.
 *
 * @pure
 */
export function tableEntry({
  title,
  columns,
  rows,
}: {
  title?: ReportText;
  columns: readonly TableColumn[];
  rows: readonly TableRow[];
}): TableEntry {
  return {
    kind: "table",
    ...(title !== undefined && { title }),
    columns,
    rows,
  };
}
