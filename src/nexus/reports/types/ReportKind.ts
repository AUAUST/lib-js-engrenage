import type { Reporter } from "#nexus/reports/ports/Reporter";

/**
 * The reporter method a report came through.
 */
export type ReportKind = keyof Reporter;
