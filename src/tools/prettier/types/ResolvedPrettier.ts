import type { File } from "#types/File";

/**
 * The resolved `prettier` config section: `prettierignore` resolves to the ignore
 * file's absolute path, `undefined` when it does not exist, and rejects when a
 * configured file is missing.
 */
export interface ResolvedPrettier {
  readonly prettierignore: Promise<File | undefined>;
}
