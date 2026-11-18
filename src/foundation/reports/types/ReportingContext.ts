import type { Reporter } from "#foundation/reports/ports/Reporter";

/**
 * A context carrying the reporter its holder reports through.
 */
export interface ReportingContext {
  readonly reporter: Reporter;
}
