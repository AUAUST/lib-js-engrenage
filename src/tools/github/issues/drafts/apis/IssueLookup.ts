import type { IssueLocation } from "#tools/github/issues/contract/index";

export interface IssueLookup {
  remember(
    location: IssueLocation,
    issue: {
      readonly id: number;
      readonly type?: string | undefined;
    },
  ): void;
  find(location: IssueLocation): Promise<{
    readonly id: number;
    readonly type: string | undefined;
  }>;
}
