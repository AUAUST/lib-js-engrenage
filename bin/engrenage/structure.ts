import { defineCommand } from "#cli/operations/defineCommand";
import { loadConfig } from "#config/operations/loadConfig";
import { hasStructureViolations } from "#structure/utils/hasStructureViolations";
import { renderStructure } from "#structure/utils/renderStructure";

export const structure = defineCommand((command) => {
  return command
    .description("Print how engrenage classifies the project directories.")
    .option(
      "--check",
      "exit non-zero on an unclassified directory of a strict environment",
      false,
    )
    .action(async ({ check }) => {
      const config = await loadConfig();

      for (const line of renderStructure(config.structure)) {
        console.info(line);
      }

      if (check && hasStructureViolations(config.structure)) {
        process.exitCode = 1;
      }
    });
});
