import type { Verbosity } from "#foundation/reports/types/Verbosity";

/**
 * The least verbose level showing a report.
 */
export type ReportLevel = Exclude<Verbosity, "silent">;
