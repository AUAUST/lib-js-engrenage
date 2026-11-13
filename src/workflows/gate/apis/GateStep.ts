import type { GateResult, GateStepEntry } from "#project/gate/index";
import type { Files } from "#types/Files";

export interface GateStep {
  /**
   * `everyone` runs the step in every gate; `agents` only in the agents' gate.
   */
  readonly audience: GateStepEntry["audience"];
  /**
   * Names the step in the failures the gate reports.
   */
  readonly name: string;
  /**
   * Checks or fixes the changed `files`; a result with `ok` false fails the gate
   * with its `output`. A thrown error fails it with its message.
   */
  run(files: Files): Promise<GateResult>;
}
