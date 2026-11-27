import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { Reporter } from "#nexus/reports/index";

/**
 * A failed run, as its failure handler receives it.
 */
export interface RunFailure {
  /**
   * The arguments the run received after the program's name.
   */
  readonly args: readonly string[];
  /**
   * The command path of the run's first invocation, as far as it resolved, when
   * the run resolved before failing.
   */
  readonly path: CommandPath | undefined;
  /**
   * The run's reporter, printing through the printer of the run's scenario.
   */
  readonly reporter: Reporter;
  /**
   * Reports the failure as the run does without a failure handler.
   */
  report(): Promise<void>;
}
