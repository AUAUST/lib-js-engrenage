/**
 * The outcome of a headless agent run.
 */
export interface AgentReport {
  /**
   * Session id a later dispatch resumes.
   */
  readonly session: string;
  readonly report: string;
  readonly succeeded: boolean;
  /**
   * Tools the run asked for and was denied, since a headless run cannot prompt.
   */
  readonly denied: readonly string[];
}
