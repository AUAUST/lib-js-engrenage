import type { GithubClient } from "#tools/github/issues/api/types/GithubClient";

// @debt `repository` is an `<owner>/<repo>` string every route splits with `splitRepository`; the access should carry the owner and name already parsed
export interface GithubAccess {
  readonly repository: string;
  readonly client: GithubClient;
}
