import type { GateStepTiming } from "#workflows/gate/types/GateStepTiming";

/**
 * The timing of a group of steps a gate run ran together, such as a stage.
 */
export interface GateGroupTiming {
  readonly name: string;
  /**
   * The group's wall time, in milliseconds.
   */
  readonly duration: number;
  readonly steps: readonly GateStepTiming[];
}
