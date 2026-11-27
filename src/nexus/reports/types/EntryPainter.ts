import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * How a printer paints the parts of an entry it lays out.
 */
export interface EntryPainter {
  /**
   * Paints reported text, its spans styled as the printer chooses.
   */
  text(text: ReportText): string;
  /**
   * Paints a heading line.
   */
  heading(line: string): string;
  /**
   * Paints the marks around reported text: glyphs, bullets and durations.
   */
  mark(mark: string): string;
}
