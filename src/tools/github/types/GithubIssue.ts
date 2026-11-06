export interface GithubIssue {
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: "open" | "closed";
  readonly type: string | undefined;
  readonly blockers: readonly string[];
  readonly subIssues: readonly {
    readonly number: number;
    readonly state: "open" | "closed";
  }[];
  readonly parent?: number | undefined;
  readonly blockedBy: readonly {
    readonly number: number;
    readonly state: "open" | "closed";
  }[];
}
