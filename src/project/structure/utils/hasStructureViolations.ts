import { values } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";

function holdsCardinalityViolation(node: StructureNode): boolean {
  return (
    node.cardinality !== undefined ||
    node.children.some(holdsCardinalityViolation)
  );
}

export function hasStructureViolations(structure: ResolvedStructure): boolean {
  return values(structure).some((environment) => {
    return (
      environment !== undefined &&
      ((environment.strictness === "strict" &&
        environment.unclassified.length > 0) ||
        holdsCardinalityViolation(environment.root))
    );
  });
}
