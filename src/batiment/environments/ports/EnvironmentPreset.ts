export interface EnvironmentPreset {
  /**
   * Names the preset, which each registered environment tuning it names
   * as its `preset`.
   */
  readonly name: string;
  /**
   * The languages the preset's environments select unless their registration or
   * `.environment.json` name others.
   */
  readonly languages?: readonly string[];
}
