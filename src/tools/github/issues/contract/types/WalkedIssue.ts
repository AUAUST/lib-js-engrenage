import type { IssueCommit } from "#tools/git/index";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

export interface WalkedIssue {
  readonly number: number;
  readonly depth: number;
  readonly type: string | undefined;
  readonly state: "open" | "closed";
  readonly closedBy?: IssueCommit | undefined;
  readonly blockers: readonly string[];
  readonly findings: readonly IssueFinding[];
  readonly openSections: readonly string[];
  readonly towards: readonly IssueCommit[];
  readonly closes: readonly IssueCommit[];
}
