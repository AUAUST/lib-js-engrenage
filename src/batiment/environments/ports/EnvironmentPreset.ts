import type { EnvironmentExecution } from "#batiment/environments/ports/EnvironmentExecution";

export interface EnvironmentPreset {
  /**
   * Names the preset, which each registered environment tuning it names
   * as its `preset`.
   */
  readonly name: string;
  // @debt the JSDoc below still lets an `.environment.json` name languages, which it no longer holds
  /**
   * The languages the preset's environments select unless their registration or
   * `.environment.json` name others.
   */
  readonly languages?: readonly string[];
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
