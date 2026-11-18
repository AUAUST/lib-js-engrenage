import { fetchLabelDiff } from "#tools/github/operations/fetchLabelDiff";
import { refreshGithubSnapshot } from "#tools/github/operations/refreshGithubSnapshot";
import type { LoadedConfig } from "#project/config/index";
import type { GithubClient } from "#tools/github/issues/api/index";

export async function pruneLabels(
  config: LoadedConfig,
  client: GithubClient,
): Promise<{
  readonly deleted: readonly string[];
  readonly refreshed: boolean;
}> {
  const { route, diff } = await fetchLabelDiff(config, client);

  if (diff.extra.length === 0) {
    return { deleted: diff.extra, refreshed: false };
  }

  for (const name of diff.extra) {
    await client.request("DELETE /repos/{owner}/{repo}/labels/{name}", {
      ...route,
      name,
    });
  }

  const refreshed = await refreshGithubSnapshot(config, client);

  return { deleted: diff.extra, refreshed };
}
