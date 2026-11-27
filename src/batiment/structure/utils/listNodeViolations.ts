import { map } from "@auaust/toolkit/iterable";

import { renderCardinalityViolation } from "#batiment/structure/utils/renderCardinalityViolation";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function listNodeViolations(node: StructureNode): string[] {
  return [...(map(node.cardinality, renderCardinalityViolation) ?? [])];
}
