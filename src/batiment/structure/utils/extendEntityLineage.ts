import { freeze } from "@auaust/toolkit/object";

import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { Directory } from "#types/Directory";

export function extendEntityLineage(
  lineage: readonly LineageMember[],
  node: StructureNode,
  path: Directory,
): readonly LineageMember[] {
  if (
    node.kind !== "namespace" &&
    node.kind !== "directory" &&
    node.kind !== "domain"
  ) {
    return lineage;
  }

  // @debt a directory node joins the lineage as a namespace, standing in for its namespace's root, since a lineage starts at one root per directory
  const member: LineageMember = freeze({
    path,
    kind: node.kind === "domain" ? "domain" : "namespace",
    layer: node.layer,
    layers: node.layers,
    isolated: node.relation === "isolated",
  });

  return freeze([...lineage, member]);
}
