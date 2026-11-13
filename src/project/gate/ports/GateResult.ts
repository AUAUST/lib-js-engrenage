/**
 * @experimental
 */
export interface GateResult {
  /**
   * Whether the step passed; a step that throws counts as not passing.
   */
  readonly ok: boolean;
  /**
   * The diagnostics reported under the step's name when it did not pass; ignored
   * when it did.
   */
  readonly output: string;
}
