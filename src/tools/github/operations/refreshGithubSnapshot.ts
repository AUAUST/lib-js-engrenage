import {
  fetchGithubSnapshot,
  readGithubSnapshot,
  type GithubClient,
} from "#tools/github/issues/api/index";
import type { LoadedConfig } from "#project/config/index";

export async function refreshGithubSnapshot(
  config: LoadedConfig,
  client: GithubClient,
): Promise<void> {
  if ((await readGithubSnapshot(config)) !== undefined) {
    await fetchGithubSnapshot(config, client);
  }
}
