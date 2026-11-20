import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import { renderStructureDiagnostic } from "#project/structure/utils/renderStructureDiagnostic";
import { renderStructureTree } from "#project/structure/utils/renderStructureTree";
import type { Alias } from "#project/structure/types/Alias";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";

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
