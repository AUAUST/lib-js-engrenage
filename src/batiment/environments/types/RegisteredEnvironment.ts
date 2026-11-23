import type { EnvironmentPreset } from "#batiment/environments/ports/EnvironmentPreset";
import type { EnvironmentRegistration } from "#batiment/environments/types/EnvironmentRegistration";
import type { Directories } from "#types/Directories";

export interface RegisteredEnvironment {
  readonly registration: EnvironmentRegistration;
  /**
   * The preset the registration names.
   */
  readonly preset: EnvironmentPreset;
  /**
   * The languages the environment selects: its registration's, else its preset's.
   */
  readonly languages: readonly string[];
  /**
   * The registration's directories but the scope root, which places
   * only its `files`.
   */
  readonly dirs: Directories;
}
