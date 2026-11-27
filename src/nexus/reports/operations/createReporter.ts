import { completionEntry } from "#nexus/reports/utils/completionEntry";
import { toReportEntry } from "#nexus/reports/utils/toReportEntry";
import type { Printer } from "#nexus/reports/ports/Printer";
import type { Reporter } from "#nexus/reports/ports/Reporter";
import type { Report } from "#nexus/reports/types/Report";
import type { ReportData } from "#nexus/reports/types/ReportData";
import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * Creates a reporter handing each report to `printer` as an entry.
 *
 * @pure
 */
export function createReporter(printer: Printer): Reporter {
  function error(report: Report, data?: ReportData) {
    printer.print(toReportEntry(report, data), "error");
  }

  function warn(report: Report, data?: ReportData) {
    printer.print(toReportEntry(report, data), "warn");
  }

  function info(report: Report, data?: ReportData) {
    printer.print(toReportEntry(report, data), "info");
  }

  function log(report: Report, data?: ReportData) {
    printer.print(toReportEntry(report, data), "log");
  }

  function debug(report: Report, data?: ReportData) {
    printer.print(toReportEntry(report, data), "debug");
  }

  function complete(text: ReportText) {
    printer.print(completionEntry(text), "complete");
  }

  return {
    error,
    warn,
    info,
    log,
    debug,
    complete,
  };
}
