/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";

export const editions = defineCommand((command) => {
  return command
    .description(
      "Generate the ES editions of TypeScript with the Baseline date of each of their libs from web-features.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } =
        await import("#project/config/operations/loadConfig");

      const { validateConfig } =
        await import("#workflows/config/operations/validateConfig");

      const { generateEditions } =
        await import("#scripts/codegen/operations/generateEditions");

      const { settleChanges } =
        await import("#workflows/cli/operations/settleChanges");

      const config = validateConfig(await loadConfig());

      await generateEditions(config);

      await settleChanges(config, {
        check,
      });
    });
});
