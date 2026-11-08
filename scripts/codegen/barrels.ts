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
      const { loadValidatedConfig } =
        await import("#workflows/config/operations/loadValidatedConfig");

      const { syncBarrels } =
        await import("#tools/typescript/operations/syncBarrels");

      const { settleChanges } =
        await import("#workflows/cli/operations/settleChanges");

      const config = await loadValidatedConfig();

      await syncBarrels(config, barrels);

      await settleChanges(config, {
        check,
      });
    });
});
