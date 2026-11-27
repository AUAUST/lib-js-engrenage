import { reportLevels } from "#foundation/reports/constants";
import { isReportShown } from "#foundation/reports/utils/isReportShown";
import type { Reporter } from "#foundation/reports/ports/Reporter";
import type { Verbosity } from "#foundation/reports/types/Verbosity";

/**
 * Wraps `reporter` so it receives only the reports `verbosity` shows,
 * read at each report.
 *
 * @pure
 */
export function filterReports(
  reporter: Reporter,
  verbosity: () => Verbosity,
): Reporter {
  function isShown(method: keyof Reporter) {
    return isReportShown(reportLevels[method], verbosity());
  }

  return {
    error(text, data) {
      if (isShown("error")) {
        reporter.error(text, data);
      }
    },
    warn(text, data) {
      if (isShown("warn")) {
        reporter.warn(text, data);
      }
    },
    info(text, data) {
      if (isShown("info")) {
        reporter.info(text, data);
      }
    },
    log(text, data) {
      if (isShown("log")) {
        reporter.log(text, data);
      }
    },
    debug(text, data) {
      if (isShown("debug")) {
        reporter.debug(text, data);
      }
    },
  };
}
