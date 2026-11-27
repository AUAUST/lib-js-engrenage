import { phaseSeparator } from "#nexus/cli/constants";
import {
  formatDuration,
  tableEntry,
  type TableEntry,
  type TableRow,
} from "#nexus/reports/index";

function findParent(
  entry: PerformanceEntry,
  entries: readonly PerformanceEntry[],
): PerformanceEntry | undefined {
  const { name } = entry;

  for (
    let end = name.lastIndexOf(phaseSeparator);
    end > 0;
    end = name.lastIndexOf(phaseSeparator, end - 1)
  ) {
    const prefix = name.slice(0, end);

    const parent = entries.findLast((other) => {
      return (
        other !== entry &&
        other.name === prefix &&
        other.startTime <= entry.startTime
      );
    });

    if (parent !== undefined) {
      return parent;
    }
  }
}

/**
 * The marks and measures of a run as a table, in the order they started: each
 * named `<parent>:<name>` nests under the latest one named `<parent>` started
 * before it, showing its name past its parent's, then its duration, blank for a
 * mark, and when it started since the process did.
 *
 * @confined
 */
export function timingsEntry(entries: readonly PerformanceEntry[]): TableEntry {
  const sorted = entries.toSorted((first, second) => {
    return first.startTime - second.startTime;
  });

  const children = new Map<PerformanceEntry | undefined, PerformanceEntry[]>();

  for (const entry of sorted) {
    const parent = findParent(entry, sorted);

    children.set(parent, [...(children.get(parent) ?? []), entry]);
  }

  const rows: TableRow[] = [];

  function addRows(parent: PerformanceEntry | undefined, depth: number) {
    for (const entry of children.get(parent) ?? []) {
      rows.push({
        cells: [
          parent === undefined
            ? entry.name
            : entry.name.slice(parent.name.length + phaseSeparator.length),
          entry.entryType === "mark" ? "" : formatDuration(entry.duration),
          `at ${formatDuration(entry.startTime)}`,
        ],
        depth,
      });

      addRows(entry, depth + 1);
    }
  }

  addRows(undefined, 0);

  return tableEntry({
    title: "Timings",
    columns: [{ align: "start" }, { align: "end" }, { align: "end" }],
    rows,
  });
}
