import { settleChanges } from "#project/sync/index";
import { createGithubClient, fetchGithubSnapshot } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const config = await loadValidatedConfig();

  await fetchGithubSnapshot(config, await createGithubClient());

  await settleChanges(config, {
    check: false,
  });
}
