import { keys } from "@auaust/toolkit/object";

import {
  fetchRepositoryLabels,
  requireCurrentRepository,
  resolveCurrentRepository,
  splitRepository,
  type GithubClient,
} from "#tools/github/issues/api/index";
import { diffLabels } from "#tools/github/utils/diffLabels";
import type { LoadedConfig } from "#project/config/index";
import type { LabelDiff } from "#tools/github/types/LabelDiff";

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

  const repository = requireCurrentRepository(
    await resolveCurrentRepository(config.context.root),
    "Reading labels",
  );

  const existing = await fetchRepositoryLabels(client, repository);

  return {
    route: splitRepository(repository),
    diff: diffLabels(labels, existing),
  };
}
