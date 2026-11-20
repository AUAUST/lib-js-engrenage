import type { EnvironmentStructure } from "#batiment/structure/types/EnvironmentStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function isViolatingNode(
  node: StructureNode,
  strictness: EnvironmentStructure["strictness"],
): boolean {
  return (
    (strictness === "strict" && node.kind === "unclassified") ||
    node.cardinality !== undefined ||
    node.twin !== undefined
  );
}
