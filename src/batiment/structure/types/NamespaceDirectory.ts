import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { Directory } from "#types/Directory";

/**
 * One directory a top-level namespace spans, with the node holding its root files
 * and top-level children: its `directory` node when the namespace spans several
 * directories, the namespace root otherwise.
 *
 * @experimental
 */
export interface NamespaceDirectory {
  readonly directory: Directory;
  readonly node: StructureNode;
}
