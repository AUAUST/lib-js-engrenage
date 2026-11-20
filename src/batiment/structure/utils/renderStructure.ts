import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import { renderStructureDiagnostic } from "#batiment/structure/utils/renderStructureDiagnostic";
import { renderStructureTree } from "#batiment/structure/utils/renderStructureTree";
import type { Alias } from "#batiment/structure/types/Alias";
import type { ResolvedStructure } from "#batiment/structure/types/ResolvedStructure";

export function renderStructure(
  structure: ResolvedStructure,
  aliases: readonly Alias[],
): string[] {
  return flatMap(values(structure), (environment, index) => {
    return environment === undefined
      ? []
      : [
          ...(index === 0 ? [] : [""]),
          ...renderStructureTree({
            environment,
            aliases,
            detailed: true,
          }),
          ...environment.diagnostics
            .filter(({ code }) => code === "unreached")
            .map(renderStructureDiagnostic),
        ];
  });
}
