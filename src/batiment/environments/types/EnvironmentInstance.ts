import type { EnvironmentPlacement } from "#batiment/environments/types/EnvironmentPlacement";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

/**
 * A registered environment in one scope: the placements it keeps there, every
 * path relative to the project root.
 */
export interface EnvironmentInstance {
  /**
   * Names the registered environment.
   */
  readonly environment: string;
  /**
   * The directory of the scope, `.` for the root.
   */
  readonly scope: Directory;
  /**
   * The directories the environment is placed on in the scope.
   */
  readonly dirs: Directories;
  /**
   * The files the environment is placed on in the scope.
   */
  readonly files: Files;
  /**
   * The directory placements of other environments below `dirs`, which replace
   * this environment in their subtrees.
   */
  readonly nested: readonly EnvironmentPlacement[];
  /**
   * Whether its placements hold a file Git does not ignore.
   */
  readonly active: boolean;
}
