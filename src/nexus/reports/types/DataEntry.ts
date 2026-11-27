import type { ReportContent } from "#nexus/reports/types/ReportContent";

/**
 * A command's result as the `value` a machine reads, with the `entries` a person
 * or an agent reads it through.
 */
export interface DataEntry {
  readonly kind: "data";
  readonly value: unknown;
  readonly entries: readonly ReportContent[];
}
