import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { renderImportCycles } from "#project/structure/utils/renderImportCycles";
import { renderStructure } from "#project/structure/utils/renderStructure";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

// @debt the command composes the structure check (report, cycles, violation exit) from four internal modules of `project/structure`; bin may reach any internal, so its "thin" rule has no lint backing
export const structure = defineCommand((command) => {
  return command
    .option(
      "--check",
      "exit non-zero on an unclassified directory of a strict environment or a runtime import cycle",
      false,
    )
    .action(async ({ check }) => {
      const config = await loadConfig();

      for (const line of renderStructure(await config.get("structure"))) {
        console.info(line);
      }

      const cycles = findImportCycles({
        root: await config.get("root"),
        structure: await config.get("structure"),
        aliases: await config.get("aliases"),
      });

      for (const line of renderImportCycles(cycles)) {
        console.info(line);
      }

      if (
        check &&
        (hasStructureViolations(await config.get("structure")) ||
          cycles.length > 0)
      ) {
        process.exitCode = 1;
      }
    });
});
