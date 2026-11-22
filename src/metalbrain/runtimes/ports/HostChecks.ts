import type { HostCheck } from "#metalbrain/runtimes/ports/HostCheck";

/**
 * The host code metalbrain's hook events call, filled by the host. Hook commands
 * load the host's checks only on the events calling one, and each check loads
 * its own code when called, so the other events keep the hook's cold start.
 */
export interface HostChecks {
  /**
   * SubagentStart: marks the started subagent's run as running.
   */
  readonly startRun: HostCheck;
  /**
   * Stop and SubagentStop: records the stopped agent's run.
   */
  readonly recordRun: HostCheck;
}
