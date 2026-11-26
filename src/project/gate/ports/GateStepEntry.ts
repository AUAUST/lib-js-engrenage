import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { GateCheck } from "#project/gate/ports/GateCheck";
import type { GateRun } from "#project/gate/ports/GateRun";
import type { GateStage } from "#project/gate/ports/GateStage";

/**
 * A gate step, whose run is loaded only when the gate runs it; a rejection fails
 * the step with its message.
 *
 * @experimental
 */
export interface GateStepEntry extends EntryShape, Lazy<GateRun> {
  /**
   * Labels the step's failures and warnings in the gate's report.
   */
  readonly name: string;
  /**
   * When the step runs: `generate` one after another first, restaging the
   * tracked files it changes, then `fixes` one after another before the changed
   * files are restaged, then `checks` and `warnings` concurrently and `commands`
   * one after another. A `warnings` step only warns; any other step that does
   * not pass fails the gate.
   */
  readonly stage: GateStage;
  /**
   * `everyone` runs the step in every gate run, the Git hook's `--everyone` run
   * included; `agents` only in the agents' default run.
   */
  readonly audience: "everyone" | "agents";
  /**
   * The step's whole-project check, run by `gate --all` after the checks of the
   * stages before its own; a step without one is left out of that run.
   */
  readonly check?: Lazy<GateCheck>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "gate.steps": GateStepEntry;
    }
  }
}
