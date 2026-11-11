import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export interface GithubIssue {
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: "open" | "closed";
  readonly type: string | undefined;
  readonly blockers: readonly string[];
  readonly subIssues: readonly (IssueLocation & {
    readonly state: "open" | "closed";
  })[];
  readonly parent?: IssueLocation | undefined;
  readonly blockedBy: readonly (IssueLocation & {
    readonly state: "open" | "closed";
  })[];
}
