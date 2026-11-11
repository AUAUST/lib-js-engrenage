import type { IssueCommit } from "#tools/git/index";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { RelatedIssue } from "#tools/github/issues/contract/types/RelatedIssue";

export interface IssueCheck {
  readonly repository: string;
  readonly findings: readonly IssueFinding[];
  readonly subIssues: readonly RelatedIssue[];
  readonly blockedBy: readonly RelatedIssue[];
  readonly towards: readonly IssueCommit[];
}
