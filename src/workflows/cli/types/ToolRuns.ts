/**
 * Several runs of a tool command's binary, each with its own arguments, run
 * concurrently; the command fails when any run fails.
 */
export interface ToolRuns {
  readonly runs: readonly (readonly string[])[];
}
