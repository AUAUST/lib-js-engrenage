import type { EnvironmentExecution } from "#batiment/environments/ports/EnvironmentExecution";
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
   * The execution fields the environment sets instead of its preset's.
   */
  readonly execution?: EnvironmentExecution;
  /**
   * Whether the environment runs through a bundler pass, instead of its preset's.
   */
  readonly bundled?: boolean;
  /**
   * The directories the environment is placed on, each covering its subtree, a
   * glob placing it on each directory it matches.
   */
  readonly dirs: Directories;
  /**
   * Globs, matched at the scope root, of the files the environment is placed on.
   */
  readonly files: Globs;
}
