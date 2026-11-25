import type { File } from "#types/File";

/**
 * The longest of `extensions` that `file` ends with.
 */
export function findFileExtension(
  file: File,
  extensions: readonly string[],
): string | undefined {
  let found: string | undefined;

  for (const extension of extensions) {
    if (
      file.endsWith(extension) &&
      (found === undefined || extension.length > found.length)
    ) {
      found = extension;
    }
  }

  return found;
}
