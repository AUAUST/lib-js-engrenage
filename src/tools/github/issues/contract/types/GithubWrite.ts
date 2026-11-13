import type { GithubBodySource } from "#tools/github/issues/contract/types/GithubBodySource";

/**
 * A `gh issue create`, `edit` or `comment` call parsed from a shell command.
 * Each field is `undefined` when the command omits it or passes it in a form the
 * parser cannot read, and `number` is always `undefined` for `create`.
 */
export interface GithubWrite {
  readonly action: "create" | "edit" | "comment";
  readonly number?: number | undefined;
  readonly repository?: string | undefined;
  readonly title?: string | undefined;
  readonly body?: GithubBodySource | undefined;
}
