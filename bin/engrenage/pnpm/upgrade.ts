import { packageJsonFile } from "#constants";
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

      const version = resolveLatestPnpm(await config.get("root"), range);

      if (resolvePnpmRangeStatus(await config.get("packageJson")) === "above") {
        console.warn(
          `pnpm ${readProjectPnpmVersion(await config.get("packageJson"))} is above engrenage's pnpm ${range}: update engrenage to support it`,
        );

        const proceeds = await createPrompter({ yes }).confirm(
          `Move it back to pnpm ^${version}?`,
        );

        if (!proceeds) {
          return;
        }
      }

      const filesystem = await config.get("filesystem");

      const content = filesystem.read(packageJsonFile);

      // @debt repeats the "No package.json found" guard of createTsdownConfig, createStepContext and syncChangesetConfig
      if (content === undefined) {
        throw new Error(
          `No ${packageJsonFile} found in ${await config.get("root")}`,
        );
      }

      const upgraded = upgradePnpmManifest(
        content,
        (await config.get("resolve"))(packageJsonFile),
        await config.get("packageJson"),
        version,
      );

      if (upgraded === content) {
        return void console.info(`Already on pnpm ${version}.`);
      }

      filesystem.write(packageJsonFile, upgraded);

      await settleChanges(config, {
        check: false,
      });

      installDependencies(await config.get("root"));
    });
});
