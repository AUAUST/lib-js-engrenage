import { map } from "@auaust/primitive-kit/arrays";

import { aliasesSection } from "#project/structure/config/sections/aliasesSection";
import { structureSection } from "#project/structure/config/sections/structureSection";
import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
import { listDomainsWithoutPurpose } from "#project/structure/utils/listDomainsWithoutPurpose";
import { renderImportCycles } from "#project/structure/utils/renderImportCycles";
import { renderStructure } from "#project/structure/utils/renderStructure";
import { typescriptSection } from "#project/tsconfig/index";
import type { LoadedConfig } from "#project/config/index";
import type { StructureCheck } from "#project/structure/types/StructureCheck";

export async function checkStructure(
  config: LoadedConfig,
): Promise<StructureCheck> {
  const structure = await config.resolve(structureSection);

  const { verbatimModuleSyntax } = await config.resolve(typescriptSection);

  const cycles = await findImportCycles({
    root: config.context.root,
    structure,
    aliases: await config.resolve(aliasesSection),
    verbatimModuleSyntax,
  });

  return {
    lines: [...renderStructure(structure), ...renderImportCycles(cycles)],
    warnings: map(listDomainsWithoutPurpose(structure), (path) => {
      return `${path} has no purpose: set one on its \`domains\` entry.`;
    }),
    violated: hasStructureViolations(structure) || cycles.length > 0,
  };
}
