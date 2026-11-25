import { freeze } from "@auaust/toolkit/object";

import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function inheritPublicRoles(
  inherited: readonly string[],
  node: StructureNode,
): readonly string[] {
  return node.publicRoles === undefined
    ? inherited
    : freeze([...inherited, ...node.publicRoles]);
}
