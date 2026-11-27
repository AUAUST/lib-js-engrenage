import type { ReportContent } from "#nexus/reports/types/ReportContent";
import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * What a reporter method takes: an entry, or text it reports as a line.
 */
export type Report = ReportText | ReportContent;
