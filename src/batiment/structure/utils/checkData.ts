import { freeze } from "@auaust/toolkit/object";

import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

export function checkData(
  { importer, target }: ImportEdge,
  { data }: ImportGrants,
): BoundaryViolation | undefined {
  if (importer === undefined || target?.environment !== "data") {
    return;
  }

  const { environment } = importer;

  return environment !== undefined && data.includes(environment)
    ? freeze({
        cause: "environment",
        boundary: undefined,
        fix: undefined,
        category: "data",
      })
    : undefined;
}
