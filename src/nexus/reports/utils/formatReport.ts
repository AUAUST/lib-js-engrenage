import type { ReportData } from "#nexus/reports/types/ReportData";

/** @pure */
export function formatReport(text: string, { source, fix }: ReportData = {}) {
  const line = source === undefined ? text : `${source}: ${text}`;

  return fix === undefined ? line : `${line}\n  ${fix}`;
}
