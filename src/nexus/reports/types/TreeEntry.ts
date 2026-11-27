import type { TreeNode } from "#nexus/reports/types/TreeNode";

/**
 * Nodes reported as a tree, each root heading its children; `compact` trees trade
 * nesting marks for density.
 */
export interface TreeEntry {
  readonly kind: "tree";
  readonly nodes: readonly TreeNode[];
  readonly compact: boolean;
}
