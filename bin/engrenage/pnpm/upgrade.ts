import { loadConfig } from "#config/utils/loadConfig";
import { packageJsonFile } from "#constants";
import { installDependencies } from "#pnpm/utils/installDependencies";
import { resolveLatestPnpm } from "#pnpm/utils/resolveLatestPnpm";
import { resolvePnpmRangeStatus } from "#pnpm/utils/resolvePnpmRangeStatus";
import { upgradePnpmManifest } from "#pnpm/utils/upgradePnpmManifest";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { settleChanges } from "#support/commander/utils/settleChanges";
import { readProjectPnpmVersion } from "#support/packageJson/utils/readProjectPnpmVersion";
import { readSharedPnpmRange } from "#support/packageJson/utils/readSharedPnpmRange";
import { createPrompter } from "#support/scaffold/utils/createPrompter";

export const upgrade = defineCommand((command) => {
  return command
    .description(
      "Move the project to the latest pnpm within engrenage's pnpm range.",
    )
    .option(
      "-y, --yes",
      "accept moving a newer pnpm back into the range",
      false,
    )
    .action(async ({ yes }) => {
      const config = await loadConfig();

      const { range } = readSharedPnpmRange();

      const version = resolveLatestPnpm(config.root, range);

      if (resolvePnpmRangeStatus(config.packageJson) === "above") {
        console.warn(
          `pnpm ${readProjectPnpmVersion(config.packageJson)} is above engrenage's pnpm ${range}: update engrenage to support it`,
        );

        const proceeds = await createPrompter({ yes }).confirm(
          `Move it back to pnpm ^${version}?`,
        );

        if (!proceeds) {
          return;
        }
      }

      const { filesystem } = config;

      const content = filesystem.read(packageJsonFile);

      // @debt repeats the "No package.json found" guard of createTsdownConfig, createStepContext and syncChangesetConfig
      if (content === undefined) {
        throw new Error(`No ${packageJsonFile} found in ${config.root}`);
      }

      const upgraded = upgradePnpmManifest(
        content,
        config.resolve(packageJsonFile),
        config.packageJson,
        version,
      );

      if (upgraded === content) {
        return void console.info(`Already on pnpm ${version}.`);
      }

      filesystem.write(packageJsonFile, upgraded);

      await settleChanges(config, {
        check: false,
      });

      installDependencies(config.root);
    });
});
