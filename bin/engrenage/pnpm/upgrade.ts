import { packageJsonFile } from "#constants";
import { packageJsonSection } from "#project/package/index";
import { readProjectPnpmVersion } from "#project/package/utils/readProjectPnpmVersion";
import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";
import { installDependencies } from "#tools/pnpm/operations/installDependencies";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";
import { upgradePnpmManifest } from "#tools/pnpm/operations/upgradePnpmManifest";
import { resolvePnpmRangeStatus } from "#tools/pnpm/utils/resolvePnpmRangeStatus";
import { createPrompter } from "#workflows/cli/operations/createPrompter";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

export const upgrade = defineCommand((command) => {
  return command
    .option(
      "-y, --yes",
      "accept moving a newer pnpm back into the range",
      false,
    )
    .action(async ({ yes }) => {
      const config = await loadConfig();

      const { range } = readSharedPnpmRange();

      const version = await resolveLatestPnpm(config.context.root, range);

      if (
        resolvePnpmRangeStatus(await config.resolve(packageJsonSection)) ===
        "above"
      ) {
        console.warn(
          `pnpm ${readProjectPnpmVersion(await config.resolve(packageJsonSection))} is above engrenage's pnpm ${range}: update engrenage to support it`,
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
        throw new Error(
          `No ${packageJsonFile} found in ${config.context.root}`,
        );
      }

      const upgraded = upgradePnpmManifest(
        content,
        config.context.path(packageJsonFile),
        await config.resolve(packageJsonSection),
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
    });
});
