import { values } from "@auaust/toolkit/object";

import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import { isViolatingNode } from "#project/structure/utils/isViolatingNode";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";

export function hasStructureViolations(structure: ResolvedStructure): boolean {
  return values(structure).some((environment) => {
    return (
      environment !== undefined &&
      (environment.unreached.length > 0 ||
        collectStructureNodes(environment.root).some((node) => {
          return isViolatingNode(node, environment.strictness);
        }))
    );
  });
}
