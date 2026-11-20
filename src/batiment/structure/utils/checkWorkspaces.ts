import { freeze } from "@auaust/toolkit/object";

import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

export function checkWorkspaces(
  { importer, target }: ImportEdge,
  { workspaces }: ImportGrants,
): BoundaryViolation | undefined {
  if (importer === undefined || target?.environment !== "workspace") {
    return;
  }

  const crosses = (
    importer.environment === "src" ||
    (importer.environment === "workspace" &&
      importer.path !== target.path &&
      workspaces.get(importer.path)?.includes(target.path) !== true)
  );

  return crosses
    ? freeze({
        cause: "workspace",
        boundary: undefined,
        fix: undefined,
      })
    : undefined;
}
