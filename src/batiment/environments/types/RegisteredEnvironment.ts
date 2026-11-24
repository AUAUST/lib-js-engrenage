import type { EnvironmentExecution } from "#batiment/environments/ports/EnvironmentExecution";
import type { EnvironmentPreset } from "#batiment/environments/ports/EnvironmentPreset";
import type { EnvironmentRegistration } from "#batiment/environments/types/EnvironmentRegistration";
import type { LanguageSelection } from "#batiment/environments/types/LanguageSelection";
import type { Directories } from "#types/Directories";

export interface RegisteredEnvironment {
  readonly registration: EnvironmentRegistration;
  /**
   * The preset the registration names.
   */
  readonly preset: EnvironmentPreset;
  /**
   * The languages the environment selects: its registration's, else its
   * preset's, each a selection.
   */
  readonly languages: readonly LanguageSelection[];
  /**
   * How the environment executes: each of its registration's execution fields,
   * else its preset's.
   */
  readonly execution: EnvironmentExecution;
  /**
   * Whether the environment runs through a bundler pass: its registration's,
   * else its preset's; unset when neither states it.
   */
  readonly bundled?: boolean;
  /**
   * The registration's directories but the scope root, which places
   * only its `files`.
   */
  readonly dirs: Directories;
}
