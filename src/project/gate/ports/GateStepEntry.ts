import type { EntryShape } from "#foundation/extensions/index";
import type { GateRun } from "#project/gate/ports/GateRun";
import type { GateStage } from "#project/gate/ports/GateStage";

/**
 * @experimental
 */
export interface GateStepEntry extends EntryShape {
  /**
   * Labels the step's failures and warnings in the gate's report.
   */
  readonly name: string;
  /**
   * When the step runs: `fixes` one after another before the changed files are
   * restaged, then `checks` and `warnings` concurrently and `commands` one after
   * another. A `warnings` step only warns; any other step that does not pass
   * fails the gate.
   */
  readonly stage: GateStage;
  /**
   * `everyone` runs the step in every gate run, the Git hook's `--everyone` run
   * included; `agents` only in the agents' default run.
   */
  readonly audience: "everyone" | "agents";
  /**
   * Loads the step's run, only when the gate runs it; a rejection fails the step
   * with its message.
   */
  load(): Promise<GateRun>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "gate.steps": GateStepEntry;
    }
  }
}
