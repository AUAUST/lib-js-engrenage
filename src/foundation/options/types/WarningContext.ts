import type { WarningReporter } from "#foundation/options/ports/WarningReporter";

/**
 * A context carrying the reporter its options warn through while resolving.
 */
export interface WarningContext {
  readonly reporter: WarningReporter;
}
