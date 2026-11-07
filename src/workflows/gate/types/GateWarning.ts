// @debt repeats the shape of `GateFailure`; one gate entry type carrying its severity could replace both
export interface GateWarning {
  readonly step: string;
  readonly output: string;
}
