import type { SpanStyle } from "#nexus/reports/types/SpanStyle";

/**
 * A span of reported text marked with what it means.
 */
export interface StyledSpan {
  readonly text: string;
  readonly style: SpanStyle;
}
