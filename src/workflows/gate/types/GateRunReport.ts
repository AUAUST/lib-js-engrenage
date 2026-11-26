import type { GateCoverage } from "#workflows/gate/types/GateCoverage";
import type { GateReport } from "#workflows/gate/types/GateReport";
import type { GateTimings } from "#workflows/gate/types/GateTimings";

export interface GateRunReport extends GateReport {
  // @debt repeats the step names `timings` holds; coverage could derive them from the timed groups
  readonly checked: GateCoverage;
  readonly timings: GateTimings;
}
