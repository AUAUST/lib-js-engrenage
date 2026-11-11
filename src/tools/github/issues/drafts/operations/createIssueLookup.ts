import { nullish, number, object, string } from "valibot";

import { validate } from "#foundation/options/index";
import {
  splitRepository,
  type GithubClient,
} from "#tools/github/issues/api/index";
import type { IssueLocation } from "#tools/github/issues/drafts/types/IssueLocation";
import type { IssueLookup } from "#tools/github/issues/drafts/types/IssueLookup";

const issueSchema = object({
  id: number(),
  type: nullish(object({ name: string() })),
});

function toKey({ repository, number }: IssueLocation) {
  return `${repository.toLowerCase()}#${number}`;
}

export function createIssueLookup(client: GithubClient): IssueLookup {
  const ids = new Map<string, number>();
  const types = new Map<string, string | undefined>();

  function remember(
    location: IssueLocation,
    issue: { readonly id: number; readonly type?: string | undefined },
  ) {
    ids.set(toKey(location), issue.id);

    if ("type" in issue) {
      types.set(toKey(location), issue.type);
    }
  }

  async function find(location: IssueLocation) {
    const key = toKey(location);

    const id = ids.get(key);

    if (id !== undefined && types.has(key)) {
      return { id, type: types.get(key) };
    }

    const { data } = await client.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        ...splitRepository(location.repository),
        issue_number: location.number,
      },
    );

    const issue = validate(
      issueSchema,
      data,
      `issue ${location.repository}#${location.number}`,
    );

    remember(location, { id: issue.id, type: issue.type?.name });

    return { id: issue.id, type: issue.type?.name };
  }

  return { remember, find };
}
