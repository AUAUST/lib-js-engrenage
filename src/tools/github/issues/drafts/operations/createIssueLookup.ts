import { nullish, number, object, string } from "valibot";

import { validate } from "#foundation/options/index";
import {
  splitRepository,
  type GithubAccess,
} from "#tools/github/issues/api/index";
import type { IssueLookup } from "#tools/github/issues/drafts/types/IssueLookup";

const issueSchema = object({
  id: number(),
  type: nullish(object({ name: string() })),
});

export function createIssueLookup({
  repository,
  client,
}: GithubAccess): IssueLookup {
  const ids = new Map<number, number>();
  const types = new Map<number, string | undefined>();

  function remember(
    number: number,
    issue: { readonly id: number; readonly type?: string | undefined },
  ) {
    ids.set(number, issue.id);

    if ("type" in issue) {
      types.set(number, issue.type);
    }
  }

  async function find(number: number) {
    const id = ids.get(number);

    if (id !== undefined && types.has(number)) {
      return { id, type: types.get(number) };
    }

    const { data } = await client.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      { ...splitRepository(repository), issue_number: number },
    );

    const issue = validate(issueSchema, data, `issue #${number}`);

    remember(number, { id: issue.id, type: issue.type?.name });

    return { id: issue.id, type: issue.type?.name };
  }

  return { remember, find };
}
