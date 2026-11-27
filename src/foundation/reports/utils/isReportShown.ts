import { verbosityLevels } from "#foundation/reports/constants";
import type { ReportLevel } from "#foundation/reports/types/ReportLevel";
import type { Verbosity } from "#foundation/reports/types/Verbosity";

/** @pure */
export function isReportShown(level: ReportLevel, verbosity: Verbosity) {
  return verbosityLevels.indexOf(level) <= verbosityLevels.indexOf(verbosity);
}
