import { defineCommand } from "#support/commander/utils/defineCommand";
import { syncBarrels } from "#typescript/utils/syncBarrels";
import { Option } from "@commander-js/extra-typings";

export default defineCommand((command) => {
  return command
    .description(
      "Fill the engrenage blocks of the barrels with re-exports of the modules they name.",
    )
    .argument(
      "[barrels...]",
      "barrels to sync, by directory name (all by default)",
    )
    .addOption(
      new Option(
        "--root <directory>",
        "project root containing the barrels",
      ).default(process.cwd(), "current directory"),
    )
    .option("--check", "report outdated barrels without writing them", false)
    .action((barrels, { root, check }) => {
      const outdated = syncBarrels({
        root,
        barrels,
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
