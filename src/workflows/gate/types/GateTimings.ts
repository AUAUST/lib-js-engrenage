import type { GateGroupTiming } from "#workflows/gate/types/GateGroupTiming";

/**
 * How long a gate run took, group by group.
 */
export interface GateTimings {
  /**
   * The groups that ran, in the order they started.
   */
  readonly groups: readonly GateGroupTiming[];
  /**
   * The run's wall time, in milliseconds, holding what no group covers.
   */
  readonly duration: number;
}
