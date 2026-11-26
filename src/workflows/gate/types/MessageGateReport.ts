import type { GateReport } from "#workflows/gate/types/GateReport";

export interface MessageGateReport extends GateReport {
  /**
   * Whether the gate rewrote the message file's `Closes` and `Towards` lines
   * into their canonical form.
   */
  readonly rewritten: boolean;
}
