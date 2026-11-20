import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import {
  renderStructureDiagnostic,
  type ResolvedStructure,
} from "#batiment/structure/index";
import { renderStructureTree } from "#project/structure/utils/renderStructureTree";
import type { Alias } from "#project/structure/types/Alias";

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
