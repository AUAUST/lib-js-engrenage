import { loadConfig } from "#config/utils/loadConfig";
import { packageJsonFile } from "#constants";
import { installDependencies } from "#pnpm/utils/installDependencies";
import { resolveLatestPnpm } from "#pnpm/utils/resolveLatestPnpm";
import { upgradePnpmManifest } from "#pnpm/utils/upgradePnpmManifest";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { settleChanges } from "#support/commander/utils/settleChanges";
import { readProjectPnpmMajor } from "#support/packageJson/utils/readProjectPnpmMajor";
import { readSharedPnpmMajor } from "#support/packageJson/utils/readSharedPnpmMajor";

export const upgrade = defineCommand((command) => {
  return command
    .description(
      "Move the project to the latest pnpm within engrenage's pnpm major.",
    )
    .action(async () => {
      const config = await loadConfig();

      const shared = readSharedPnpmMajor();
      const major = readProjectPnpmMajor(config.packageJson);

      if (major !== undefined && major > shared) {
        throw new Error(
          `The project uses pnpm ${major}, ahead of engrenage's pnpm ${shared}: update engrenage instead`,
        );
      }

      const version = resolveLatestPnpm(config.root, shared);

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
        return void console.info(`Already on pnpm ${shared} (${version}).`);
      }

      filesystem.write(packageJsonFile, upgraded);

      await settleChanges(config, {
        check: false,
      });

      installDependencies(config.root);
    });
});
