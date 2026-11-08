import { freeze } from "@auaust/toolkit/object";

import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { ImportEdge } from "#project/structure/types/ImportEdge";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

export function checkWorkspaces(
  { importer, target }: ImportEdge,
  { workspaces }: ImportGrants,
): BoundaryViolation | undefined {
  if (importer === undefined || target?.environment !== "workspace") {
    return;
  }

  const crosses =
    importer.environment === "src" ||
    (importer.environment === "workspace" &&
      importer.path !== target.path &&
      workspaces.get(importer.path)?.includes(target.path) !== true);

  return crosses
    ? freeze({
        cause: "workspace",
        boundary: undefined,
        fix: undefined,
      })
    : undefined;
}
