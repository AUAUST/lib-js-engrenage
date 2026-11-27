import type { ReportData } from "#nexus/reports/types/ReportData";

export interface Reporter {
  /**
   * Reports a failure.
   */
  error(text: string, data?: ReportData): void;
  /**
   * Reports a problem that does not fail the run.
   */
  warn(text: string, data?: ReportData): void;
  /**
   * Reports progress or a per-item detail a run can skip reading.
   */
  info(text: string, data?: ReportData): void;
  /**
   * Reports the command's result or an instruction the user must act on.
   */
  log(text: string, data?: ReportData): void;
  /**
   * Reports a fact that helps understanding a run, such as a stack trace.
   */
  debug(text: string, data?: ReportData): void;
}
