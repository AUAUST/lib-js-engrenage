import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface EnvironmentRegistration {
  readonly name: string;
  /**
   * Names the environment preset the registration tunes.
   */
  readonly preset: string;
  /**
   * The languages the environment selects instead of its preset's.
   */
  readonly languages?: readonly string[];
  /**
   * The directories the environment is placed on, each covering its subtree.
   */
  readonly dirs: Directories;
  /**
   * Globs, matched at the scope root, of the files the environment is placed on.
   */
  readonly files: Globs;
}
