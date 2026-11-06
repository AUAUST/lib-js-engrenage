import { freeze } from "@auaust/toolkit/object";

import { getImportCategory } from "#project/structure/utils/getImportCategory";
import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportEdge } from "#project/structure/types/ImportEdge";
import type { ImportGrants } from "#project/structure/types/ImportGrants";
import type { TestVariant } from "#project/structure/types/TestVariant";

// @debt repeats the test variant grants `resolveImportRules` expands for the project maps; #227 renders the maps from these checks instead
const forbidden: Readonly<Record<TestVariant, readonly ImportCategory[]>> =
  freeze({
    plain: freeze(["internal-aliases", "bin"] as const),
    src: freeze(["public-entries"] as const),
    dist: freeze(["internal-aliases", "bin"] as const),
  });

export function checkTests(
  edge: ImportEdge,
  { published }: ImportGrants,
): BoundaryViolation | undefined {
  const { importer } = edge;

  if (
    !published ||
    importer?.environment !== "tests" ||
    importer.variant === undefined
  ) {
    return;
  }

  const category = getImportCategory(edge);

  return category !== undefined &&
    forbidden[importer.variant].includes(category)
    ? freeze({
        cause: "testVariant",
        boundary: undefined,
        fix: undefined,
        category,
      })
    : undefined;
}
