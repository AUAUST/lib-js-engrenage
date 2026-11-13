import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

/**
 * @stable
 */
export type FileLocation =
  | { readonly file: File }
  | { readonly directory: Directory }
  | { readonly globs: Globs };
