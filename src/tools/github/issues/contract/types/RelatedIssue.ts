import type { IssueCommit } from "#tools/git/index";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export interface RelatedIssue extends IssueLocation {
  readonly state: "open" | "closed";
  readonly closedBy?: IssueCommit | undefined;
}
