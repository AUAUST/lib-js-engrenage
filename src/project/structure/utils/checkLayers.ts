import { indexRoleName } from "#project/roles/constants";
import { checkBoundary } from "#project/structure/utils/checkBoundary";
import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { Entity } from "#project/structure/types/Entity";
import type { ImportKind } from "#project/structure/types/ImportKind";

// @debt the rule split follows the target's kind rather than the broken relation, so either rule can report any boundary cause
export function checkLayers(
  importer: Entity,
  target: Entity,
  kind: ImportKind,
): BoundaryViolation | undefined {
  return target.kind === "domain" && target.role === indexRoleName
    ? checkBoundary(importer, target, kind)
    : undefined;
}
