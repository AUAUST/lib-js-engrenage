export interface IssueCommit {
  readonly hash: string;
  readonly subject: string;
  readonly closes: readonly number[];
  readonly towards: readonly number[];
}
