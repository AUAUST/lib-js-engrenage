import type { ReportEntry } from "#nexus/reports/types/ReportEntry";
import type { ReportKind } from "#nexus/reports/types/ReportKind";

/**
 * Renders the stream of entries a run reports, each as it arrives with the
 * reporter method it came through, once the run's verbosity shows it.
 */
export interface Printer {
  /**
   * Renders `entry`, reported through `kind`; never filters it.
   */
  print(entry: ReportEntry, kind: ReportKind): void;
}
