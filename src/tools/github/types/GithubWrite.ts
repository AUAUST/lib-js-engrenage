import type { GithubBodySource } from "#tools/github/types/GithubBodySource";

export interface GithubWrite {
  readonly action: "create" | "edit" | "comment";
  readonly number?: number | undefined;
  readonly repository?: string | undefined;
  readonly title?: string | undefined;
  readonly body?: GithubBodySource | undefined;
}
