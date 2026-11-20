import { flatMap } from "@auaust/toolkit/iterable";

import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function collectStructureNodes(node: StructureNode): StructureNode[] {
  return [node, ...flatMap(node.children, collectStructureNodes)];
}
