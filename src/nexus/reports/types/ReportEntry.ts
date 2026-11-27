import type { CompletionEntry } from "#nexus/reports/types/CompletionEntry";
import type { ReportContent } from "#nexus/reports/types/ReportContent";

/**
 * An entry a printer renders.
 */
export type ReportEntry = ReportContent | CompletionEntry;
