/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#support/commander/utils/defineCommand";

export const rules = defineCommand((command) => {
  return command
    .description(
      "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async ({ check }) => {
      const { loadConfig } = await import("#config/utils/loadConfig");

      const { syncRuleTypes } = await import("#eslint/utils/syncRuleTypes");

      const config = await loadConfig();

      const outdated = await syncRuleTypes({
        config,
        check,
      });

      for (const file of outdated) {
        console.info(check ? `outdated: ${file}` : `synced: ${file}`);
      }

      if (check && outdated.length > 0) {
        process.exitCode = 1;
      }
    });
});
