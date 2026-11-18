import { formatReport } from "#foundation/reports/utils/formatReport";
import type { Reporter } from "#foundation/reports/ports/Reporter";
import type { ReportData } from "#foundation/reports/types/ReportData";

function render(text: string, data?: ReportData): string {
  return `${formatReport(text, data)}\n`;
}

export function createConsoleReporter({
  isVerbose = () => false,
}: { isVerbose?(): boolean } = {}): Reporter {
  return {
    error(text, data) {
      process.stderr.write(render(text, data));
    },
    warn(text, data) {
      process.stderr.write(render(text, data));
    },
    info(text, data) {
      if (isVerbose()) {
        process.stderr.write(render(text, data));
      }
    },
    log(text, data) {
      process.stdout.write(render(text, data));
    },
  };
}
