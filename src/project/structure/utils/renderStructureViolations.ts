import { flatMap } from "@auaust/toolkit/array";
import { filter, map } from "@auaust/toolkit/iterable";
import { values } from "@auaust/toolkit/object";

import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import { findStructureAliases } from "#project/structure/utils/findStructureAliases";
import { isViolatingNode } from "#project/structure/utils/isViolatingNode";
import { listNodeViolations } from "#project/structure/utils/listNodeViolations";
import { renderStructureLabel } from "#project/structure/utils/renderStructureLabel";
import { renderUnreachedNode } from "#project/structure/utils/renderUnreachedNode";
import type { Alias } from "#project/structure/types/Alias";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";

export function renderStructureViolations(
  structure: ResolvedStructure,
  aliases: readonly Alias[],
): string[] {
  return flatMap(values(structure), (environment) => {
    if (environment === undefined) {
      return [];
    }

    const found = findStructureAliases(environment, aliases);

    const violating = filter(
      collectStructureNodes(environment.root),
      (node) => {
        return isViolatingNode(node, environment.strictness);
      },
    );

    return [
      ...map(violating, (node) => {
        return [
          node.path,
          renderStructureLabel({
            node,
            aliases: found,
            detailed: true,
          }),
          ...listNodeViolations(node),
        ].join("  ");
      }),
      ...map(environment.unreached, renderUnreachedNode),
    ];
  });
}
