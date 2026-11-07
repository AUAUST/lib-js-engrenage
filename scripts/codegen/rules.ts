/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";

export const rules = defineCommand((command) => {
  return command
    .description(
      "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async ({ check }) => {
      const { loadConfig } =
        await import("#project/config/operations/loadConfig");

      const { validateConfig } =
        await import("#workflows/registry/operations/validateConfig");

      const { generateRuleTypes } =
        await import("#scripts/codegen/operations/generateRuleTypes");

      const config = validateConfig(await loadConfig());

      const outdated = await generateRuleTypes({
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
