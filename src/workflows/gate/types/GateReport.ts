import type { BudgetFinding } from "#tools/agents/index";
import type { GateFailure } from "#workflows/gate/types/GateFailure";

export interface GateReport {
  readonly failures: readonly GateFailure[];
  readonly warnings: readonly BudgetFinding[];
}
