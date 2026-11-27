import { filterReports } from "#foundation/reports/operations/filterReports";
import { formatReport } from "#foundation/reports/utils/formatReport";
import type { Reporter } from "#foundation/reports/ports/Reporter";
import type { ReportData } from "#foundation/reports/types/ReportData";
import type { Verbosity } from "#foundation/reports/types/Verbosity";

function render(text: string, data?: ReportData): string {
  return `${formatReport(text, data)}\n`;
}

/**
 * Creates a reporter printing results to stdout and every other report to stderr,
 * each only when `verbosity` shows it.
 *
 * @pure
 */
export function createConsoleReporter({
  verbosity = () => "default",
}: { verbosity?(): Verbosity } = {}): Reporter {
  return filterReports(
    {
      /** @printing */
      error(text, data) {
        process.stderr.write(render(text, data));
      },
      /** @printing */
      warn(text, data) {
        process.stderr.write(render(text, data));
      },
      /** @printing */
      info(text, data) {
        process.stderr.write(render(text, data));
      },
      /** @printing */
      log(text, data) {
        process.stdout.write(render(text, data));
      },
      /** @printing */
      debug(text, data) {
        process.stderr.write(render(text, data));
      },
    },
    verbosity,
  );
}
