import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import { createStructureTree } from "#batiment/structure/utils/createStructureTree";
import { renderStructureDiagnostic } from "#batiment/structure/utils/renderStructureDiagnostic";
import { renderDenseEntry } from "#nexus/reports/index";
import type { Alias } from "#batiment/structure/types/Alias";
import type { ResolvedStructure } from "#batiment/structure/types/ResolvedStructure";

export function renderStructure(
  structure: ResolvedStructure,
  aliases: readonly Alias[],
): string[] {
  return flatMap(values(structure), (namespace, index) => {
    return namespace === undefined
      ? []
      : [
          ...(index === 0 ? [] : [""]),
          ...renderDenseEntry(
            createStructureTree({
              namespace,
              aliases,
              detailed: true,
            }),
          ),
          ...namespace.diagnostics
            .filter(({ code }) => code === "unreached")
            .map(renderStructureDiagnostic),
        ];
  });
}
