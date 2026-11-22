import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { ReadyIssue } from "#tools/github/issues/contract/types/ReadyIssue";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

export interface IssueTreeCheck {
  readonly repository: string;
  readonly checkouts: readonly IssueCheckout[];
  readonly issues: readonly WalkedIssue[];
  readonly ready: readonly ReadyIssue[];
  readonly planningDue: readonly IssueLocation[];
  readonly finished: boolean;
}
