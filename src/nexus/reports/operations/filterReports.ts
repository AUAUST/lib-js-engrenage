import { reportLevels } from "#nexus/reports/constants";
import { isReportShown } from "#nexus/reports/utils/isReportShown";
import type { Printer } from "#nexus/reports/ports/Printer";
import type { Verbosity } from "#nexus/reports/types/Verbosity";

/**
 * Wraps `printer` so it receives only the entries `verbosity` shows,
 * read at each entry.
 *
 * @pure
 */
export function filterReports(
  printer: Printer,
  verbosity: () => Verbosity,
): Printer {
  function print(...[entry, kind]: Parameters<Printer["print"]>) {
    if (isReportShown(reportLevels[kind], verbosity())) {
      printer.print(entry, kind);
    }
  }

  return { print };
}
