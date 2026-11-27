import type { Report } from "#nexus/reports/types/Report";
import type { ReportData } from "#nexus/reports/types/ReportData";
import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * Reports a run's output: text as a line its `data` details, or an entry.
 */
export interface Reporter {
  /**
   * Reports a failure.
   */
  error(text: ReportText, data?: ReportData): void;
  /**
   * Reports `report`, an entry or text, as a failure.
   */
  error(report: Report): void;
  /**
   * Reports a problem that does not fail the run.
   */
  warn(text: ReportText, data?: ReportData): void;
  /**
   * Reports `report`, an entry or text, as a problem that does not fail the run.
   */
  warn(report: Report): void;
  /**
   * Reports progress or a per-item detail a run can skip reading.
   */
  info(text: ReportText, data?: ReportData): void;
  /**
   * Reports `report`, an entry or text, as progress or a per-item detail.
   */
  info(report: Report): void;
  /**
   * Reports the command's result or an instruction the user must act on.
   */
  log(text: ReportText, data?: ReportData): void;
  /**
   * Reports `report`, an entry or text, as the command's result.
   */
  log(report: Report): void;
  /**
   * Reports a fact that helps understanding a run, such as a stack trace.
   */
  debug(text: ReportText, data?: ReportData): void;
  /**
   * Reports `report`, an entry or text, as a fact that helps understanding a run.
   */
  debug(report: Report): void;
  /**
   * Reports the command's one-line outcome.
   */
  complete(text: ReportText): void;
}
