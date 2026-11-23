import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function isViolatingNode(
  node: StructureNode,
  strictness: NamespaceStructure["strictness"],
): boolean {
  return (
    (strictness === "strict" && node.kind === "unclassified") ||
    node.cardinality !== undefined ||
    node.twin !== undefined
  );
}
