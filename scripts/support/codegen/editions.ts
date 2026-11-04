/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#cli/operations/defineCommand";

export const editions = defineCommand((command) => {
  return command
    .description(
      "Generate the ES editions of TypeScript with the Baseline date of each of their libs from web-features.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } = await import("#config/operations/loadConfig");

      const { generateEditions } =
        await import("#typescript/operations/generateEditions");

      const { settleChanges } = await import("#cli/operations/settleChanges");

      const config = await loadConfig();

      await generateEditions(config);

      await settleChanges(config, {
        check,
      });
    });
});
