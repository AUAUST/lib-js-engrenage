import { loadConfig } from "#project/config/operations/loadConfig";
import { aliasesSection, structureSection } from "#project/structure/index";
import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { renderImportCycles } from "#project/structure/utils/renderImportCycles";
import { renderStructure } from "#project/structure/utils/renderStructure";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { validateConfig } from "#workflows/config/operations/validateConfig";

// @debt the command composes the structure check (report, cycles, violation exit) from four internal modules of `project/structure`; bin may reach any internal, so its "thin" rule has no lint backing
export const structure = defineCommand((command) => {
  return command
    .option(
      "--check",
      "exit non-zero on an unclassified directory of a strict environment or a runtime import cycle",
      false,
    )
    .action(async ({ check }) => {
      const config = validateConfig(await loadConfig());

      for (const line of renderStructure(
        await config.resolve(structureSection),
      )) {
        console.info(line);
      }

      const cycles = await findImportCycles({
        root: config.context.root,
        structure: await config.resolve(structureSection),
        aliases: await config.resolve(aliasesSection),
      });

      for (const line of renderImportCycles(cycles)) {
        console.info(line);
      }

      if (
        check &&
        (hasStructureViolations(await config.resolve(structureSection)) ||
          cycles.length > 0)
      ) {
        process.exitCode = 1;
      }
    });
});
