/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";

export const barrels = defineCommand((command) => {
  return command
    .description(
      "Fill the engrenage blocks of the barrels with re-exports of the modules they name.",
    )
    .argument(
      "[barrels...]",
      "barrels to sync, by directory name (all by default)",
    )
    .option("--check", "report outdated barrels without writing them", false)
    .action(async (barrels, { check }) => {
      const { loadConfig } =
        await import("#project/config/operations/loadConfig");

      const { syncBarrels } =
        await import("#tools/typescript/operations/syncBarrels");

      const { settleChanges } =
        await import("#workflows/cli/operations/settleChanges");

      const config = await loadConfig();

      syncBarrels(config, barrels);

      await settleChanges(config, {
        check,
      });
    });
});
