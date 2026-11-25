/**
 * A search's query: `syntax` in the query syntax, or raw `text` searched as a
 * text query, never parsed.
 */
export type RecordQuery =
  | { readonly kind: "syntax"; readonly query: string }
  | { readonly kind: "text"; readonly text: string };
