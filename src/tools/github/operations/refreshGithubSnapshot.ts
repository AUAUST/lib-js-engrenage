import {
  fetchGithubSnapshot,
  readGithubSnapshot,
  type GithubClient,
} from "#tools/github/issues/api/index";
import type { LoadedConfig } from "#project/config/index";

export async function refreshGithubSnapshot(
  config: LoadedConfig,
  client: GithubClient,
): Promise<boolean> {
  if ((await readGithubSnapshot(config)) === undefined) {
    return false;
  }

  await fetchGithubSnapshot(config, client);

  return true;
}
