import { isString } from "@auaust/toolkit";

import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * The plain text `text` reads, its styles dropped.
 *
 * @pure
 */
export function readReportText(text: ReportText): string {
  return isString(text)
    ? text
    : text
        .map((span) => {
          return isString(span) ? span : span.text;
        })
        .join("");
}
