import type { IssueCommit } from "#tools/git/index";

export interface RelatedIssue {
  readonly number: number;
  readonly state: "open" | "closed";
  readonly closedBy?: IssueCommit | undefined;
}
