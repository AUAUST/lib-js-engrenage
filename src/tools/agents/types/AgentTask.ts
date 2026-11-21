import type { AgentOutcome } from "#tools/agents/types/AgentOutcome";
import type { PlannerMode } from "#tools/agents/types/PlannerMode";

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
   * The `<category>.<n>` of each of the brief's `Backlog:` lines.
   */
  readonly backlog?: readonly string[];
  readonly mode?: PlannerMode;
  readonly outcome?: AgentOutcome;
}
