import type { TreeEntry } from "#nexus/reports/types/TreeEntry";
import type { TreeNode } from "#nexus/reports/types/TreeNode";

/**
 * A tree of `nodes`; a `compact` one trades nesting marks for density.
 *
 * @pure
 */
export function treeEntry(
  nodes: readonly TreeNode[],
  { compact = false }: { compact?: boolean } = {},
): TreeEntry {
  return {
    kind: "tree",
    nodes,
    compact,
  };
}
