import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { renderImportCycles } from "#project/structure/utils/renderImportCycles";
import { renderStructure } from "#project/structure/utils/renderStructure";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

export const structure = defineCommand((command) => {
  return command
    .option(
      "--check",
      "exit non-zero on an unclassified directory of a strict environment or a runtime import cycle",
      false,
    )
    .action(async ({ check }) => {
      const config = await loadConfig();

      for (const line of renderStructure(config.structure)) {
        console.info(line);
      }

      const cycles = findImportCycles({
        root: config.root,
        structure: config.structure,
        aliases: config.aliases,
      });

      for (const line of renderImportCycles(cycles)) {
        console.info(line);
      }

      if (
        check &&
        (hasStructureViolations(config.structure) || cycles.length > 0)
      ) {
        process.exitCode = 1;
      }
    });
});
