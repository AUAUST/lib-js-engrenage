import type { File } from "#types/File";

/**
 * A backlog category file: its parsed YAML, unvalidated, or the error parsing it.
 */
export type BacklogCategoryFile = {
  readonly file: File;
  readonly name: string;
} & (
  | { readonly kind: "parsed"; readonly data: unknown }
  | { readonly kind: "invalid"; readonly error: unknown }
);
