import type { SpanStyle } from "#nexus/reports/types/SpanStyle";
import type { StyledSpan } from "#nexus/reports/types/StyledSpan";

/**
 * A span of `text` marked with the meaning `style` names.
 *
 * @pure
 */
export function styled(style: SpanStyle, text: string): StyledSpan {
  return { text, style };
}
