import { indexRoleName } from "#project/roles/constants";
import { checkBoundary } from "#project/structure/utils/checkBoundary";
import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { ImportEdge } from "#project/structure/types/ImportEdge";

// @debt the rule split follows the target's kind rather than the broken relation, so either rule can report any boundary cause
export function checkSurfaces({
  importer,
  target,
  resolved,
  kind,
}: ImportEdge): BoundaryViolation | undefined {
  if (
    importer === undefined ||
    target === undefined ||
    (resolved?.kind !== "relative" && resolved?.kind !== "alias")
  ) {
    return;
  }

  return target.kind === "role" ||
    (target.role !== undefined && target.role !== indexRoleName)
    ? checkBoundary(importer, target, kind)
    : undefined;
}
