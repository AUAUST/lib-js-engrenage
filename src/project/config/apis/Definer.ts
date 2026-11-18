import type { Directory } from "#types/Directory";

/**
 * A tool config definer, loading the config of the working directory's project,
 * or with `at(root)` of the project holding `root`.
 */
export interface Definer<Args extends readonly unknown[], Result> {
  /**
   * Defines the config of the project holding the working directory at load time.
   */
  (...args: Args): Result;

  /**
   * Returns the definer loading the config of the project holding `root`: a
   * directory, or a file URL such as `import.meta.url`, whose directory is used
   * unless its path ends with `/`.
   */
  at(root: Directory | URL): (...args: Args) => Result;
}
