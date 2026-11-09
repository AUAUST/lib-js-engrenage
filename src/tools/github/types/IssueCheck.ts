import type { IssueCommit } from "#tools/git/index";
import type { IssueFinding } from "#tools/github/types/IssueFinding";
import type { RelatedIssue } from "#tools/github/types/RelatedIssue";

export interface IssueCheck {
  readonly findings: readonly IssueFinding[];
  readonly subIssues: readonly RelatedIssue[];
  readonly blockedBy: readonly RelatedIssue[];
  readonly towards: readonly IssueCommit[];
}
