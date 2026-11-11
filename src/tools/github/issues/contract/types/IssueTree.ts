import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";

export interface IssueTree {
  readonly issue: GithubIssue;
  readonly subIssues: readonly IssueTree[];
}
