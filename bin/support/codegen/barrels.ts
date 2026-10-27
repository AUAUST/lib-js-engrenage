import { loadConfig } from "#config/utils/loadConfig";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { settleChanges } from "#support/commander/utils/settleChanges";
import { syncBarrels } from "#typescript/utils/syncBarrels";

export default defineCommand((command) => {
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
      const config = await loadConfig();

      syncBarrels(config, barrels);

      settleChanges(config, {
        check,
      });
    });
});
