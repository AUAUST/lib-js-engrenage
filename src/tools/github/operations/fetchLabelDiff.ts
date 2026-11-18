import { array, nullish, object, string } from "valibot";

import { keys } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import {
  resolveCurrentRepository,
  splitRepository,
  type GithubClient,
} from "#tools/github/issues/api/index";
import { diffLabels } from "#tools/github/utils/diffLabels";
import type { LoadedConfig } from "#project/config/index";
import type { LabelDiff } from "#tools/github/types/LabelDiff";

const labelsSchema = array(
  object({
    name: string(),
    description: nullish(string(), null),
    color: string(),
  }),
);

export async function fetchLabelDiff(
  config: LoadedConfig,
  client: GithubClient,
): Promise<{
  readonly route: { readonly owner: string; readonly repo: string };
  readonly diff: LabelDiff;
}> {
  const { labels } = await config.resolve("github");

  if (keys(labels).length === 0) {
    throw new Error(
      "github.labels is empty: declare the repository's labels first",
    );
  }

  const repository = await resolveCurrentRepository(config.context.root);

  if (repository === undefined) {
    throw new Error(
      "Labels need the current repository: set `repository` in package.json or add an `origin` remote",
    );
  }

  const route = splitRepository(repository);

  const existing = await client.paginate(
    "GET /repos/{owner}/{repo}/labels",
    route,
  );

  return {
    route,
    diff: diffLabels(
      labels,
      validate(labelsSchema, existing, `labels of ${repository}`),
    ),
  };
}
