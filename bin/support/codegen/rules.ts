import { syncRuleTypes } from "#support/eslint/utils/syncRuleTypes";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { Option } from "@commander-js/extra-typings";

export default defineCommand((command) => {
  return command
    .description(
      "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
    )
    .addOption(
      new Option("--root <directory>", "package root").default(
        process.cwd(),
        "current directory",
      ),
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async ({ root, check }) => {
      const outdated = await syncRuleTypes({
        root,
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
