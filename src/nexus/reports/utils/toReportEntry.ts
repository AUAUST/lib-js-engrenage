import { isString } from "@auaust/toolkit";

import { lineEntry } from "#nexus/reports/utils/lineEntry";
import type { Report } from "#nexus/reports/types/Report";
import type { ReportContent } from "#nexus/reports/types/ReportContent";
import type { ReportData } from "#nexus/reports/types/ReportData";

/**
 * The entry `report` states: itself, or a line of its text that `data` details.
 *
 * @pure
 */
export function toReportEntry(
  report: Report,
  data?: ReportData,
): ReportContent {
  return isString(report) || !("kind" in report)
    ? lineEntry(report, data)
    : report;
}
