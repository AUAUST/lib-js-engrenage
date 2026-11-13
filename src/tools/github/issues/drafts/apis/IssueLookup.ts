import type { IssueLocation } from "#tools/github/issues/contract/index";

export interface IssueLookup {
  /**
   * Caches an issue's id and, when given, its type, so `find` skips the request.
   */
  remember(
    location: IssueLocation,
    issue: {
      readonly id: number;
      readonly type?: string | undefined;
    },
  ): void;
  /**
   * Returns the issue's id and type name, `undefined` when it has no type,
   * fetching the issue unless both are cached. Rejects when the request fails or
   * the response is malformed.
   */
  find(location: IssueLocation): Promise<{
    readonly id: number;
    readonly type: string | undefined;
  }>;
}
