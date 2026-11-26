import type { GateResult, GateStepEntry } from "#project/gate/index";
import type { Files } from "#types/Files";

export interface GateStep {
  /**
   * The audience of the step's entry, as `GateStepEntry.audience` states.
   */
  readonly audience: GateStepEntry["audience"];
  /**
   * Names the step in the failures the gate reports.
   */
  readonly name: string;
  /**
   * Checks or fixes the changed `files`, given the `removed` ones, as `GateRun`
   * states. A result with `ok` false fails the step with its `output`, an
   * exception with its message; `GateStepEntry.stage` states whether a failing
   * step fails the gate or only warns. Its `warnings` are reported as a warning
   * whether or not it passed, both under the result's `name` when it sets one.
   */
  run(files: Files, removed: Files): Promise<GateResult>;
}
