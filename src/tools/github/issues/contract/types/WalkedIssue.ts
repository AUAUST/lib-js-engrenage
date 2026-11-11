import type { IssueCommit } from "#tools/git/index";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export interface WalkedIssue extends IssueLocation {
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
