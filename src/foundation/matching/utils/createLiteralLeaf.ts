import { normalizeText } from "#foundation/matching/utils/normalizeText";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";

/**
 * A term or phrase leaf holding `value` normalized, restricted to `field` when
 * given; `undefined` when nothing remains of `value` to match.
 */
export function createLiteralLeaf(
  kind: "term" | "phrase",
  value: string,
  field?: string,
): QueryLeaf | undefined {
  const normalized = normalizeText(value);

  if (normalized === "") {
    return;
  }

  return {
    kind,
    value: normalized,
    field,
  };
}
