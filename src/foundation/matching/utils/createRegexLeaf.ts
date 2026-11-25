import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";

/**
 * A leaf matching the case-insensitive JavaScript regex `source`, restricted to
 * `field` when given; `undefined` when `source` is empty or no valid regex.
 */
export function createRegexLeaf(
  source: string,
  field?: string,
): QueryLeaf | undefined {
  if (source === "") {
    return;
  }

  try {
    return {
      kind: "regex",
      value: source,
      pattern: new RegExp(source, "i"),
      field,
    };
  } catch {
    return;
  }
}
