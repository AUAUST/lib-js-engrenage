import { formatReport } from "#foundation/reports/utils/formatReport";
import type { Reporter } from "#foundation/reports/ports/Reporter";
import type { ReportData } from "#foundation/reports/types/ReportData";

function render(text: string, data?: ReportData): string {
  return `${formatReport(text, data)}\n`;
}

/**
 * @pure
 */
export function createConsoleReporter({
  isVerbose = () => false,
}: { isVerbose?(): boolean } = {}): Reporter {
  return {
    /**
     * @printing
     */
    error(text, data) {
      process.stderr.write(render(text, data));
    },
    /**
     * @printing
     */
    warn(text, data) {
      process.stderr.write(render(text, data));
    },
    /**
     * @printing
     */
    info(text, data) {
      if (isVerbose()) {
        process.stderr.write(render(text, data));
      }
    },
    /**
     * @printing
     */
    log(text, data) {
      process.stdout.write(render(text, data));
    },
  };
}
