import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

/**
 * The shape the config key named after an environment resolves to; reading one
 * of another shape throws.
 */
export interface ResolvedEnvironment {
  /**
   * Whether at least one of the environment's directories exists.
   */
  readonly active: boolean;
  /**
   * The environment's directories, without those another environment claims
   * unless its directories are configured explicitly.
   */
  readonly dirs: Directories;
  /**
   * The environment's code files, from the project root; absent when it holds no
   * code.
   */
  readonly globs?: Globs;
  /**
   * Globs, inside `dirs`, of the files tools produce.
   */
  readonly generated?: Globs;
  /**
   * Globs, inside `dirs`, of the files tools discover by path, which may export
   * defaults.
   */
  readonly discovered?: Globs;
  /**
   * The files at the project root the environment holds when the root is one of
   * its directories, which `dirs` then leaves out so the root is not walked.
   */
  readonly rootFiles?: Globs;
}
