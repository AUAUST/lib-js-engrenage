import { syncAgentFiles } from "#agents/utils/syncAgentFiles";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { Option } from "@commander-js/extra-typings";

export default defineCommand((command) => {
  return command
    .description(
      "Fill the engrenage blocks of the agent files from the shared fragments.",
    )
    .addOption(
      new Option(
        "--root <directory>",
        "project root containing the agent files",
      ).default(process.cwd(), "current directory"),
    )
    .option("--check", "report outdated files without writing them", false)
    .action(({ root, check }) => {
      const outdated = syncAgentFiles({
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
