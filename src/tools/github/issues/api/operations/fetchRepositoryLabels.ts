import { array, nullish, number, object, string } from "valibot";

import { validate } from "#foundation/options/index";
import { splitRepository } from "#tools/github/issues/api/utils/splitRepository";
import type { GithubClient } from "#tools/github/issues/api/types/GithubClient";

const labelsSchema = array(
  object({
    id: number(),
    node_id: string(),
    name: string(),
    description: nullish(string(), null),
    color: string(),
  }),
);

export async function fetchRepositoryLabels(
  client: GithubClient,
  repository: string,
) {
  const labels = await client.paginate(
    "GET /repos/{owner}/{repo}/labels",
    splitRepository(repository),
  );

  return validate(labelsSchema, labels, `labels of ${repository}`);
}
