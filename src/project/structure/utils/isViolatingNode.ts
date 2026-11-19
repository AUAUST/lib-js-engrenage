import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";

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
