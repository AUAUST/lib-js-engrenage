/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#support/commander/utils/defineCommand";

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
      const { loadConfig } = await import("#config/utils/loadConfig");

      const { syncBarrels } = await import("#typescript/utils/syncBarrels");

      const { settleChanges } =
        await import("#support/commander/utils/settleChanges");

      const config = await loadConfig();

      syncBarrels(config, barrels);

      settleChanges(config, {
        check,
      });
    });
});
