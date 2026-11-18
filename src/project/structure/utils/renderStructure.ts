import { flatMap } from "@auaust/toolkit/array";
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
          ...environment.unreached.map(({ path, kind, config, files }) => {
            const sources = [...(config ? ["the config"] : []), ...files];

            return `${path}  unreached ${kind}, declared by ${sources.join(", ")}`;
          }),
        ];
  });
}
