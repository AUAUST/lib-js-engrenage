import { freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { getTargetScope } from "#batiment/structure/utils/getTargetScope";
import type { BoundaryCause } from "#batiment/structure/types/BoundaryCause";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

function violation(cause: BoundaryCause): BoundaryViolation {
  return freeze({
    cause,
    boundary: undefined,
    fix: undefined,
  });
}

export function checkWorkspaces(
  edge: ImportEdge,
  { scopes, entries }: ImportGrants,
): BoundaryViolation | undefined {
  const { importer, resolved } = edge;
  const targetScope = getTargetScope(edge);

  if (
    importer === undefined ||
    targetScope === undefined ||
    importer.scope === targetScope
  ) {
    return;
  }

  if (importer.scope === rootScope) {
    return importer.namespace !== undefined &&
      entries.includes(importer.namespace)
      ? violation("scope")
      : undefined;
  }

  if (resolved?.kind !== "scope") {
    return violation("scopePath");
  }

  if (scopes.get(importer.scope)?.includes(targetScope) !== true) {
    return violation("scope");
  }

  return resolved.exported ? undefined : violation("unexportedSubpath");
}
