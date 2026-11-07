import { freeze } from "@auaust/toolkit/object";

import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureNode } from "#project/structure/types/StructureNode";

export function loosenStructureNode(
  node: StructureNode,
  unclassified: StructureKind,
): StructureNode {
  const children = node.children.map((child) =>
    loosenStructureNode(child, unclassified),
  );

  if (node.kind !== "unclassified") {
    return freeze({ ...node, children });
  }

  return freeze({
    path: node.path,
    name: node.name,
    kind: unclassified,
    source: node.source,
    ...(node.layer === undefined ? {} : { layer: node.layer }),
    children,
  });
}
