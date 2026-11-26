import type { GateCoverage } from "#workflows/gate/types/GateCoverage";
import type { GateReport } from "#workflows/gate/types/GateReport";

export interface GateRunReport extends GateReport {
  readonly checked: GateCoverage;
}
