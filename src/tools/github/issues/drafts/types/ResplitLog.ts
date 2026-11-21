import type { IssueLocation } from "#tools/github/issues/contract/index";

export interface ResplitLog {
  readonly plan: IssueLocation;
  readonly lines: readonly string[];
}
