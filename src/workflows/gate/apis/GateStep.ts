import type { GateResult, GateStepEntry } from "#project/gate/index";
import type { Files } from "#types/Files";

export interface GateStep {
  readonly audience: GateStepEntry["audience"];
  readonly name: string;
  run(files: Files): Promise<GateResult>;
}
