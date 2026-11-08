import { freeze } from "@auaust/toolkit/object";

import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { ImportEdge } from "#project/structure/types/ImportEdge";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

export function checkData(
  { importer, target }: ImportEdge,
  { data }: ImportGrants,
): BoundaryViolation | undefined {
  if (importer === undefined || target?.environment !== "data") {
    return;
  }

  const { environment } = importer;

  return data.includes(environment)
    ? freeze({
        cause: "environment",
        boundary: undefined,
        fix: undefined,
        category: "data",
      })
    : undefined;
}
