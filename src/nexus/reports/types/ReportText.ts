import type { ReportSpan } from "#nexus/reports/types/ReportSpan";

/**
 * Reported text: plain, or the spans it joins.
 */
export type ReportText = string | readonly ReportSpan[];
