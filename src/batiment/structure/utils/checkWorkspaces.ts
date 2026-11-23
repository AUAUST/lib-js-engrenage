import { freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

export function checkWorkspaces(
  { importer, target }: ImportEdge,
  { scopes, entries }: ImportGrants,
): BoundaryViolation | undefined {
  if (
    importer === undefined ||
    target === undefined ||
    target.scope === rootScope ||
    importer.scope === target.scope
  ) {
    return;
  }

  const crosses = importer.scope === rootScope
    ? (
        importer.environment !== undefined &&
        entries.includes(importer.environment)
      )
    : scopes.get(importer.scope)?.includes(target.scope) !== true;

  return crosses
    ? freeze({
        cause: "scope",
        boundary: undefined,
        fix: undefined,
      })
    : undefined;
}
