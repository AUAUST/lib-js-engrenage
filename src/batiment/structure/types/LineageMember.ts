import type { Directory } from "#types/Directory";

/**
 * A member of a file's lineage: its top-level namespace, the directory of that
 * namespace holding it, then each namespace and domain above it, with its layer
 * among its parent's layers, the layers it orders its own children into, and
 * whether its children are isolated from each other.
 */
export interface LineageMember {
  readonly path: Directory;
  readonly kind: "namespace" | "directory" | "domain";
  readonly layer: number | undefined;
  readonly layers: readonly string[] | undefined;
  readonly isolated: boolean;
}
