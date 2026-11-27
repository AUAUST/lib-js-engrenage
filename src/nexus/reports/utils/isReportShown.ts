import { verbosityLevels } from "#nexus/reports/constants";
import type { ReportLevel } from "#nexus/reports/types/ReportLevel";
import type { Verbosity } from "#nexus/reports/types/Verbosity";

/** @pure */
export function isReportShown(level: ReportLevel, verbosity: Verbosity) {
  return verbosityLevels.indexOf(level) <= verbosityLevels.indexOf(verbosity);
}
