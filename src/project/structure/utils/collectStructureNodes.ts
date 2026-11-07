import { flatMap } from "@auaust/primitive-kit/arrays";

import type { StructureNode } from "#project/structure/types/StructureNode";

export function collectStructureNodes(node: StructureNode): StructureNode[] {
  return [node, ...flatMap(node.children, collectStructureNodes)];
}
