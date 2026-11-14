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
   * Checks or fixes the changed `files`. A result with `ok` false fails the step
   * with its `output`, a thrown error with its message; `GateStepEntry.stage`
   * states whether a failing step fails the gate or only warns.
   */
  run(files: Files): Promise<GateResult>;
}
