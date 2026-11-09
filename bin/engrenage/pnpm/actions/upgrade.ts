import { packageJsonFile } from "#constants";
import {
  readProjectPnpmVersion,
  readSharedPnpmRange,
} from "#project/package/index";
import {
  installDependencies,
  resolveLatestPnpm,
  resolvePnpmRangeStatus,
  upgradePnpmManifest,
} from "#tools/pnpm/index";
import { loadValidatedConfig } from "#workflows/config/index";
import { createPrompter } from "#workflows/init/index";
import { settleChanges } from "#workflows/sync/index";

export default async function ({ yes }: { yes: boolean }): Promise<void> {
  const config = await loadValidatedConfig();

  const { range } = readSharedPnpmRange();

  const version = await resolveLatestPnpm(config.context.root, range);

  if (resolvePnpmRangeStatus(await config.resolve("packageJson")) === "above") {
    console.warn(
      `pnpm ${readProjectPnpmVersion(await config.resolve("packageJson"))} is above engrenage's pnpm ${range}: update engrenage to support it`,
    );

    const proceeds = await createPrompter({ yes }).confirm(
      `Move it back to pnpm ^${version}?`,
    );

    if (!proceeds) {
      return;
    }
  }

  const filesystem = config.context.filesystem;

  const content = await filesystem.read(packageJsonFile);

  // @debt repeats the "No package.json found" guard of createTsdownConfig, createStepContext and syncChangesetConfig
  if (content === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.context.root}`);
  }

  const upgraded = upgradePnpmManifest(
    content,
    config.context.path(packageJsonFile),
    await config.resolve("packageJson"),
    version,
  );

  if (upgraded === content) {
    return void console.info(`Already on pnpm ${version}.`);
  }

  await filesystem.write(packageJsonFile, upgraded);

  await settleChanges(config, {
    check: false,
  });

  await installDependencies(config.context.root);
}
