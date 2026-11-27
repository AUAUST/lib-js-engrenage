import { readReportText } from "#nexus/reports/utils/readReportText";
import { renderEntry } from "#nexus/reports/utils/renderEntry";
import type { EntryPainter } from "#nexus/reports/types/EntryPainter";
import type { ReportEntry } from "#nexus/reports/types/ReportEntry";

const plain: EntryPainter = {
  text: readReportText,
  heading: (line) => line,
  mark: (mark) => mark,
};

/**
 * The lines `entry` prints as plain, dense text, styles dropped: nothing for an
 * entry holding no item, row or node.
 *
 * @pure
 */
export function renderDenseEntry(entry: ReportEntry): string[] {
  return renderEntry(entry, plain);
}
