import type { GithubBodySource } from "#tools/github/issues/contract/types/GithubBodySource";

export interface GithubWrite {
  readonly action: "create" | "edit" | "comment";
  readonly number?: number | undefined;
  readonly repository?: string | undefined;
  readonly title?: string | undefined;
  readonly body?: GithubBodySource | undefined;
}
