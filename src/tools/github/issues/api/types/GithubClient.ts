import type { Octokit } from "@octokit/core";
import type { PaginateInterface } from "@octokit/plugin-paginate-rest";

export interface GithubClient extends Octokit {
  readonly paginate: PaginateInterface;
}
