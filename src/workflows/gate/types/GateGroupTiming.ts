import type { GateStepTiming } from "#workflows/gate/types/GateStepTiming";

/**
 * The timing of a group of steps a gate run ran together, such as a stage.
 */
export interface GateGroupTiming {
  readonly name: string;
  /**
   * In milliseconds, the wall time of a group whose steps ran concurrently,
   * otherwise the sum of its steps' durations.
   */
  readonly duration: number;
  readonly steps: readonly GateStepTiming[];
}
