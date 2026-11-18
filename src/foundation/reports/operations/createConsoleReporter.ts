import type { Reporter } from "#foundation/reports/ports/Reporter";
import type { ReportData } from "#foundation/reports/types/ReportData";

function render(text: string, { source, fix }: ReportData = {}): string {
  const line = source === undefined ? text : `${source}: ${text}`;

  return fix === undefined ? `${line}\n` : `${line}\n  ${fix}\n`;
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
