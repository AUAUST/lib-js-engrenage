import type { StructureNode } from "#batiment/structure/index";

export function collectRoleNodes(node: StructureNode): StructureNode[] {
  return node.children
    .filter((child) => child.kind === "role")
    .flatMap((child) => {
      return [child, ...collectRoleNodes(child)];
    });
}
