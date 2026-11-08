import { aliasesSection, structureSection } from "#project/structure/index";
import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { listDomainsWithoutPurpose } from "#project/structure/utils/listDomainsWithoutPurpose";
import { renderImportCycles } from "#project/structure/utils/renderImportCycles";
import { renderStructure } from "#project/structure/utils/renderStructure";
import { typescriptSection } from "#project/tsconfig/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

// @debt the command composes the structure check (report, cycles, violation exit) from four internal modules of `project/structure`; bin may reach any internal, so its "thin" rule has no lint backing
export const structure = defineCommand((command) => {
  return command
    .option(
      "--check",
      "exit non-zero on an unclassified directory of a strict environment, a role cardinality violation or a runtime import cycle",
      false,
    )
    .action(async ({ check }) => {
      const config = await loadValidatedConfig();

      for (const line of renderStructure(
        await config.resolve(structureSection),
      )) {
        console.info(line);
      }

      const { verbatimModuleSyntax } = await config.resolve(typescriptSection);

      const cycles = await findImportCycles({
        root: config.context.root,
        structure: await config.resolve(structureSection),
        aliases: await config.resolve(aliasesSection),
        verbatimModuleSyntax,
      });

      for (const line of renderImportCycles(cycles)) {
        console.info(line);
      }

      for (const path of listDomainsWithoutPurpose(
        await config.resolve(structureSection),
      )) {
        console.warn(`${path} has no purpose: set one on its \`domains\` entry.`);
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
