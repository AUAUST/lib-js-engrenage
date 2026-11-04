/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#cli/operations/defineCommand";

export const config = defineCommand((command) => {
  return command
    .description(
      "Generate the documented Config interface from the descriptions of the config schema.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } = await import("#config/operations/loadConfig");

      const { generateConfigTypes } =
        await import("#config/operations/generateConfigTypes");

      const { settleChanges } = await import("#cli/operations/settleChanges");

      const resolved = await loadConfig();

      await generateConfigTypes(resolved);

      await settleChanges(resolved, {
        check,
      });
    });
});
