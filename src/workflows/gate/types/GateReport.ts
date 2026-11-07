import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

export interface GateReport {
  readonly failures: readonly GateFailure[];
  readonly warnings: readonly GateWarning[];
}
