import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

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
        ];
  });
}
