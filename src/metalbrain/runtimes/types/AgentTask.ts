import type { AgentOutcome } from "#metalbrain/runtimes/types/AgentOutcome";

/**
 * What a run worked on and how it handed back, read from its brief and
 * final report.
 */
export interface AgentTask {
  /**
   * The `<owner>/<repo>#<n>` of the brief's `Issue:` line.
   */
  readonly issue?: string;
  /**
   * The path of the brief's `Draft:` line.
   */
  readonly draft?: string;
  /**
   * The entry ID of each of the brief's `Backlog:` lines.
   */
  readonly backlog?: readonly string[];
  readonly outcome?: AgentOutcome;
}
