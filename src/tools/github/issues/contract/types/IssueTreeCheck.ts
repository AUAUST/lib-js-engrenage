import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

export interface IssueTreeCheck {
  readonly issues: readonly WalkedIssue[];
  readonly next: number | undefined;
}
