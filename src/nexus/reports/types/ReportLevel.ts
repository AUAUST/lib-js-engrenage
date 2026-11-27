import type { Verbosity } from "#nexus/reports/types/Verbosity";

/**
 * The least verbose level showing a report.
 */
export type ReportLevel = Exclude<Verbosity, "silent">;
