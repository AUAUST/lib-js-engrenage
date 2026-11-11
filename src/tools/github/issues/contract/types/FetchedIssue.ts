import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";

export interface FetchedIssue extends GithubIssue {
  readonly id: number;
  readonly nodeId: string;
  readonly labels: readonly string[];
  readonly fields: Readonly<
    Record<string, string | number | readonly string[]>
  >;
  readonly stateReason: string | undefined;
  readonly subIssues: readonly {
    readonly id: number;
    readonly number: number;
    readonly state: "open" | "closed";
  }[];
  readonly blockedBy: readonly {
    readonly id: number;
    readonly number: number;
    readonly state: "open" | "closed";
  }[];
}
