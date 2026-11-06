import { freeze } from "@auaust/toolkit/object";

import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { ImportEdge } from "#project/structure/types/ImportEdge";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

// @debt repeats the data grants `resolveImportRules` expands for the project maps; #227 renders the maps from these checks instead
export function checkData(
  { importer, target }: ImportEdge,
  { published }: ImportGrants,
): BoundaryViolation | undefined {
  if (importer === undefined || target?.environment !== "data") {
    return;
  }

  const { environment } = importer;

  return environment === "bin" ||
    environment === "tooling" ||
    (environment === "src" && published)
    ? freeze({
        cause: "environment",
        boundary: undefined,
        fix: undefined,
        category: "data",
      })
    : undefined;
}
