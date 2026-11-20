import { freeze } from "@auaust/toolkit/object";

import { getImportCategory } from "#batiment/structure/utils/getImportCategory";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

export function checkTests(
  edge: ImportEdge,
  { variants }: ImportGrants,
): BoundaryViolation | undefined {
  const { importer } = edge;

  if (importer?.environment !== "tests" || importer.variant === undefined) {
    return;
  }

  const category = getImportCategory(edge);

  return category !== undefined &&
    variants[importer.variant]?.includes(category) === true
    ? freeze({
        cause: "testVariant",
        boundary: undefined,
        fix: undefined,
        category,
      })
    : undefined;
}
