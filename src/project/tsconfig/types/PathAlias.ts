import type { File } from "#types/File";

/**
 * A package specifier resolved to one file: `name` is the entry it builds to,
 * `index` for the package itself and `<subpath>/index` for a directory entry,
 * and `path` the file from the project root.
 */
export interface PathAlias {
  name: string;
  path: File;
}
