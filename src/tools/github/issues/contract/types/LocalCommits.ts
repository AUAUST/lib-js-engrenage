import type { IssueCommit } from "#tools/git/index";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export interface LocalCommits {
  readonly checkouts: readonly IssueCheckout[];
  closedBy(issue: IssueLocation): IssueCommit | undefined;
  towards(issue: IssueLocation): readonly IssueCommit[];
  closes(issue: IssueLocation): readonly IssueCommit[];
}
