import { flatMap, map } from "@auaust/toolkit/array";
import { unique } from "@auaust/toolkit/iterable";
import { values } from "@auaust/toolkit/object";

import {
  renderImportCycle,
  type StructureReport,
} from "#batiment/structure/index";
import { findImportCycles } from "#project/structure/operations/findImportCycles";
import type { LoadedConfig } from "#project/config/index";

export async function reportStructure(
  config: LoadedConfig,
): Promise<StructureReport> {
  const structure = await config.resolve("structure");

  const { verbatimModuleSyntax } = await config.resolve("typescript");

  const scopes = await config.resolve("scopes");

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
    facts: { structure, cycles },
    diagnostics: [
      ...flatMap(values(structure), (environment) => {
        return environment?.diagnostics ?? [];
      }),
      ...map(cycles, (cycle) => {
        return {
          severity: "error" as const,
          code: "import-cycle" as const,
          message: renderImportCycle(cycle),
          files: [...unique(cycle)],
        };
      }),
      ...scopes.diagnostics,
    ],
  };
}
