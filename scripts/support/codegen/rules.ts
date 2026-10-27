import { loadConfig } from "#config/utils/loadConfig";
import { syncRuleTypes } from "#eslint/utils/syncRuleTypes";
import { defineCommand } from "#support/commander/utils/defineCommand";

export default defineCommand((command) => {
  return command
    .description(
      "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async ({ check }) => {
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
