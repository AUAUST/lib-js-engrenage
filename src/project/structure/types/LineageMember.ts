import type { Directory } from "#types/Directory";

/**
 * A namespace or domain above a file, with its layer among its parent's layers,
 * the layers it orders its own children into, and whether its children are
 * isolated from each other.
 */
export interface LineageMember {
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
  readonly layer: number | undefined;
  readonly layers: readonly string[] | undefined;
  readonly isolated: boolean;
}
