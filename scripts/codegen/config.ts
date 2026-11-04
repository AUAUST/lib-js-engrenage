/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";

export const config = defineCommand((command) => {
  return command
    .description(
      "Generate the documented Config interface from the descriptions of the config schema.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } =
        await import("#workflows/registry/operations/loadConfig");

      const { generateConfigTypes } =
        await import("#scripts/codegen/generateConfigTypes");

      const { settleChanges } =
        await import("#workflows/cli/operations/settleChanges");

      const resolved = await loadConfig();

      await generateConfigTypes(resolved);

      await settleChanges(resolved, {
        check,
      });
    });
});
