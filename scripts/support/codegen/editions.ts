/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#support/commander/utils/defineCommand";

export const editions = defineCommand((command) => {
  return command
    .description(
      "Generate the ES editions of TypeScript with the Baseline date of each of their libs from web-features.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } = await import("#config/utils/loadConfig");

      const { syncEditions } = await import("#typescript/utils/syncEditions");

      const { settleChanges } =
        await import("#support/commander/utils/settleChanges");

      const config = await loadConfig();

      await syncEditions(config);

      await settleChanges(config, {
        check,
      });
    });
});
