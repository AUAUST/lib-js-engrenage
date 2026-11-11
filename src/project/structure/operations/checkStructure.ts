import { map } from "@auaust/primitive-kit/arrays";

import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { listDomainsWithoutPurpose } from "#project/structure/utils/listDomainsWithoutPurpose";
import { renderImportCycles } from "#project/structure/utils/renderImportCycles";
import { renderStructure } from "#project/structure/utils/renderStructure";
import type { LoadedConfig } from "#project/config/index";
import type { StructureCheck } from "#project/structure/types/StructureCheck";

export async function checkStructure(
  config: LoadedConfig,
): Promise<StructureCheck> {
  const structure = await config.resolve("structure");

  const { verbatimModuleSyntax } = await config.resolve("typescript");

  const cycles = await findImportCycles({
    root: config.context.root,
    filesystem: config.context.filesystem,
    structure,
    aliases: await config.resolve("aliases"),
    verbatimModuleSyntax,
    languages: map(
      await config.context.registry.contributions("languages", config),
      ({ entry }) => entry,
    ),
  });

  return {
    lines: [...renderStructure(structure), ...renderImportCycles(cycles)],
    warnings: map(listDomainsWithoutPurpose(structure), (path) => {
      return `${path} has no purpose: set one on its \`domains\` entry.`;
    }),
    violated: hasStructureViolations(structure) || cycles.length > 0,
  };
}
