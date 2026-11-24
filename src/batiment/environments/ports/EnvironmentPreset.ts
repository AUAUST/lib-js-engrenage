import type { EnvironmentExecution } from "#batiment/environments/ports/EnvironmentExecution";
import type { LanguageChoice } from "#batiment/environments/types/LanguageChoice";

export interface EnvironmentPreset {
  /**
   * Names the preset, which each registered environment tuning it names
   * as its `preset`.
   */
  readonly name: string;
  /**
   * The languages the preset's environments select unless their registration
   * names others.
   */
  readonly languages?: readonly LanguageChoice[];
  /**
   * How the preset's environments execute, each field kept unless their
   * registration tunes it.
   */
  readonly execution?: EnvironmentExecution;
  /**
   * Whether the preset's environments run through a bundler pass; unset,
   * their host decides.
   */
  readonly bundled?: boolean;
}
