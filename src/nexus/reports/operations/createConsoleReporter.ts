import { createReporter } from "#nexus/reports/operations/createReporter";
import { densePrinter } from "#nexus/reports/operations/densePrinter";
import { filterReports } from "#nexus/reports/operations/filterReports";
import type { Reporter } from "#nexus/reports/ports/Reporter";
import type { Verbosity } from "#nexus/reports/types/Verbosity";

/**
 * Creates a reporter printing through `densePrinter` the reports
 * `verbosity` shows.
 *
 * @pure
 */
export function createConsoleReporter({
  verbosity = () => "default",
}: { verbosity?(): Verbosity } = {}): Reporter {
  return createReporter(filterReports(densePrinter, verbosity));
}
