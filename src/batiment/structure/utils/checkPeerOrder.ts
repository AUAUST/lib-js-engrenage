import type { BoundaryCause } from "#batiment/structure/types/BoundaryCause";
import type { LineageMember } from "#batiment/structure/types/LineageMember";

/**
 * Checks whether `from` may import its sibling `to` under the layers and isolation
 * of `container`, their shared parent: a lower layer is reachable, a higher one
 * never, and the same layer unless `container` isolates its children.
 */
export function checkPeerOrder(
  container: LineageMember,
  from: LineageMember,
  to: LineageMember,
): Extract<BoundaryCause, "higherLayer" | "isolatedPeer"> | undefined {
  if (container.layers !== undefined) {
    if (
      from.layer === undefined ||
      to.layer === undefined ||
      to.layer > from.layer
    ) {
      return "higherLayer";
    }

    if (to.layer < from.layer) {
      return;
    }
  }

  return container.isolated ? "isolatedPeer" : undefined;
}
