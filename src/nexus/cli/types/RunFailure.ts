import type { CommandPath } from "#nexus/cli/types/CommandPath";

/**
 * A failed run, as its failure handler receives it.
 */
export interface RunFailure {
  /**
   * The command path of the run's first invocation, as far as it resolved, when
   * the run resolved before failing.
   */
  readonly path: CommandPath | undefined;
  /**
   * Reports the failure as the run does without a failure handler.
   */
  report(): Promise<void>;
}
