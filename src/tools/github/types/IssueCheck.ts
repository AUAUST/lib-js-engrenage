import type { IssueFinding } from "#tools/github/types/IssueFinding";

export interface IssueCheck {
  readonly findings: readonly IssueFinding[];
  readonly openSubIssues: readonly number[];
}
