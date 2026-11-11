import type { EntryShape } from "#foundation/extensions/index";
import type { GateRun } from "#project/gate/ports/GateRun";
import type { GateStage } from "#project/gate/ports/GateStage";

export interface GateStepEntry extends EntryShape {
  readonly name: string;
  readonly stage: GateStage;
  readonly audience: "everyone" | "agents";
  load(): Promise<GateRun>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "gate.steps": GateStepEntry;
    }
  }
}
