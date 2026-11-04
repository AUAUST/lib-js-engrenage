import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { renderStructure } from "#project/structure/utils/renderStructure";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

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
