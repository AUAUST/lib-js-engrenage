import { syncAgentFiles } from "#agents/utils/syncAgentFiles";
import { loadConfig } from "#config/utils/loadConfig";
import { defineCommand } from "#support/commander/utils/defineCommand";

export default defineCommand((command) => {
  return command
    .description(
      "Fill the engrenage blocks of the agent files from the shared fragments.",
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async ({ check }) => {
      const config = await loadConfig();

      const outdated = syncAgentFiles({
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
