import { settleChanges } from "#project/sync/index";
import { createGithubClient, pruneLabels } from "#tools/github/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const {
    deleted,
    refreshed,
  } = await pruneLabels(config, await createGithubClient());

  for (const name of deleted) {
    reporter.log(`deleted ${name}`);
  }

  if (refreshed) {
    await settleChanges(config, { check: false });
  }
}
