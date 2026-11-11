import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { RequestError } from "@octokit/request-error";

import { githubApiVersion } from "#tools/github/issues/api/constants";
import { resolveGithubToken } from "#tools/github/issues/api/operations/resolveGithubToken";
import type { GithubClient } from "#tools/github/issues/api/types/GithubClient";

const PaginatingOctokit = Octokit.plugin(paginateRest);

export async function createGithubClient(): Promise<GithubClient> {
  const client = new PaginatingOctokit({
    auth: await resolveGithubToken(),
    request: {
      headers: { "x-github-api-version": githubApiVersion },
    },
  });

  client.hook.error("request", (error, { method }) => {
    if (!(error instanceof RequestError)) {
      throw error;
    }

    throw new RequestError(
      `GitHub request ${method} ${error.request.url} failed with ${error.status}: ${error.message}`,
      error.status,
      { request: error.request, response: error.response },
    );
  });

  return client;
}
