import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

export interface IssueTreeCheck {
  readonly repository: string;
  readonly issues: readonly WalkedIssue[];
  readonly next: IssueLocation | undefined;
}
