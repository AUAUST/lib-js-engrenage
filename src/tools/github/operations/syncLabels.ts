import { fetchLabelDiff } from "#tools/github/operations/fetchLabelDiff";
import { refreshGithubSnapshot } from "#tools/github/operations/refreshGithubSnapshot";
import type { LoadedConfig } from "#project/config/index";
import type { GithubClient } from "#tools/github/issues/api/index";
import type { LabelDiff } from "#tools/github/types/LabelDiff";

export async function syncLabels(
  config: LoadedConfig,
  client: GithubClient,
  { check }: { readonly check: boolean },
): Promise<{ readonly diff: LabelDiff; readonly refreshed: boolean }> {
  const { route, diff } = await fetchLabelDiff(config, client);

  if (check || (diff.create.length === 0 && diff.update.length === 0)) {
    return { diff, refreshed: false };
  }

  for (const { name, description, color } of diff.create) {
    await client.request("POST /repos/{owner}/{repo}/labels", {
      ...route,
      name,
      description,
      color,
    });
  }

  for (const { name, description, color, current } of diff.update) {
    await client.request("PATCH /repos/{owner}/{repo}/labels/{name}", {
      ...route,
      name: current,
      new_name: name,
      description,
      color,
    });
  }

  const refreshed = await refreshGithubSnapshot(config, client);

  return { diff, refreshed };
}
