/**
 * What a gate run checked, so a passing run can state it.
 */
export interface GateCoverage {
  /**
   * The names of the steps that ran, in the order their stages ran.
   */
  readonly steps: readonly string[];
  /**
   * How many changed files the steps checked, or `"project"` when they checked
   * the whole project.
   */
  readonly scope: number | "project";
  /**
   * Whether an earlier passing run on the same tree stood in for the steps.
   */
  readonly reused: boolean;
}
