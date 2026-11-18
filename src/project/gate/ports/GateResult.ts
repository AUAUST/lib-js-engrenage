/**
 * @experimental
 */
export interface GateResult {
  /**
   * Whether the step passed; a step that fails unexpectedly counts as not passing.
   */
  readonly ok: boolean;
  /**
   * The diagnostics reported under the step's name when it did not pass; ignored
   * when it did. Warnings belong in `warnings`.
   */
  readonly output: string;
  /**
   * Diagnostics reported under the step's name as a warning, whether or
   * not the step passed.
   */
  readonly warnings?: string;
}
