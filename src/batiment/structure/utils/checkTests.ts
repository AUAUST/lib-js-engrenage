import { freeze } from "@auaust/toolkit/object";

import { getImportCategory } from "#batiment/structure/utils/getImportCategory";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

export function checkTests(
  edge: ImportEdge,
  { variants, entries }: ImportGrants,
): BoundaryViolation | undefined {
  const variant = edge.importer?.variant;

  if (variant === undefined) {
    return;
  }

  const category = getImportCategory(edge, entries);

  return category !== undefined &&
    variants[variant]?.includes(category) === true
    ? freeze({
        cause: "testVariant",
        boundary: undefined,
        fix: undefined,
        category,
      })
    : undefined;
}
