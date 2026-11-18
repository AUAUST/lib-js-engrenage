import { settleChanges } from "#project/sync/index";
import { createGithubClient, syncLabels } from "#tools/github/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const {
    diff: { create, update, extra },
    refreshed,
  } = await syncLabels(config, await createGithubClient(), { check });

  if (check) {
    for (const { name } of create) {
      reporter.log(`missing ${name}`);
    }

    for (const { name } of update) {
      reporter.log(`differs ${name}`);
    }

    for (const name of extra) {
      reporter.log(`extra ${name}`);
    }

    if (create.length > 0 || update.length > 0 || extra.length > 0) {
      process.exitCode = 1;
    }

    return;
  }

  for (const { name } of create) {
    reporter.log(`created ${name}`);
  }

  for (const { name } of update) {
    reporter.log(`updated ${name}`);
  }

  for (const name of extra) {
    reporter.log(
      `extra ${name}: delete it with \`engrenage github labels prune\``,
    );
  }

  if (refreshed) {
    await settleChanges(config, { check: false });
  }
}
