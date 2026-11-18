import { settleChanges } from "#project/sync/index";
import { createGithubClient, fetchGithubSnapshot } from "#tools/github/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  await fetchGithubSnapshot(config, await createGithubClient());

  await settleChanges(config, {
    check: false,
  });
}
