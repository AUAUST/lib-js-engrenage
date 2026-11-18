import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

export interface StepsOutcome {
  readonly failures: GateFailure[];
  readonly warnings: GateWarning[];
}
