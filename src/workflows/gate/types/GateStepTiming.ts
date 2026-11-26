export interface GateStepTiming {
  readonly name: string;
  /**
   * How long the step ran, in milliseconds.
   */
  readonly duration: number;
}
