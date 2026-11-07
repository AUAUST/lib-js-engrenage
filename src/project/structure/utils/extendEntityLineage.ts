import { freeze } from "@auaust/toolkit/object";

import type { LineageMember } from "#project/structure/types/LineageMember";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { Directory } from "#types/Directory";

export function extendEntityLineage(
  lineage: readonly LineageMember[],
  node: StructureNode,
  path: Directory,
): readonly LineageMember[] {
  if (node.kind !== "namespace" && node.kind !== "domain") {
    return lineage;
  }

  const member: LineageMember = freeze({
    path,
    kind: node.kind,
    layer: node.layer,
    layers: node.layers,
    isolated: node.relation === "isolated",
  });

  return freeze([...lineage, member]);
}
