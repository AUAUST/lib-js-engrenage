import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

/**
 * Where a file resource lives: one file, one directory or a glob set. A file or
 * directory path must lie within the project root and is kept relative to it.
 *
 * @stable
 */
export type FileLocation =
  | { readonly file: File }
  | { readonly directory: Directory }
  | { readonly globs: Globs };
