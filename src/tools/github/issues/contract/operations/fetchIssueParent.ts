import { number, object, string } from "valibot";

import { validate } from "#foundation/options/index";
import {
  isMissingResource,
  readApiRepository,
  splitRepository,
  type GithubAccess,
} from "#tools/github/issues/api/index";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

const parentSchema = object({
  number: number(),
  repository_url: string(),
});

async function requestParent(
  { repository, client }: GithubAccess,
  issue: number,
) {
  try {
    const { data } = await client.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/parent",
      { ...splitRepository(repository), issue_number: issue },
    );

    return data;
  } catch (error) {
    if (isMissingResource(error)) {
      return;
    }

    throw error;
  }
}

export async function fetchIssueParent(
  access: GithubAccess,
  issue: number,
): Promise<IssueLocation | undefined> {
  const data = await requestParent(access, issue);

  if (data === undefined) {
    return;
  }

  const parent = validate(parentSchema, data, `parent of #${issue}`);

  return {
    repository: readApiRepository(parent.repository_url),
    number: parent.number,
  };
}
