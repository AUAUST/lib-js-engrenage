/**
 * Frontmatter keys sync owns in a generated file: each of `keys` is set to its
 * entry in `values`, or removed when `values` has none. Other keys, and keys a
 * preserve comment lists, stay untouched.
 */
export interface GeneratedFrontmatter {
  keys: readonly string[];
  values: Readonly<Record<string, unknown>>;
}
