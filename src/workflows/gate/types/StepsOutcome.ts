import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateGroupTiming } from "#workflows/gate/types/GateGroupTiming";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

export interface StepsOutcome {
  readonly failures: GateFailure[];
  readonly warnings: GateWarning[];
  readonly timing: GateGroupTiming;
}
