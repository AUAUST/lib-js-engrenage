/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#cli/utils/defineCommand";

export const config = defineCommand((command) => {
  return command
    .description(
      "Generate the documented Config interface from the descriptions of the config schema.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } = await import("#config/utils/loadConfig");

      const { syncConfigTypes } = await import("#config/utils/syncConfigTypes");

      const { settleChanges } = await import("#cli/utils/settleChanges");

      const resolved = await loadConfig();

      await syncConfigTypes(resolved);

      await settleChanges(resolved, {
        check,
      });
    });
});
