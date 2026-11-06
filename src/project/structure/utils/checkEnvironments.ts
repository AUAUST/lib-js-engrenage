import { freeze } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { elementEnvironments } from "#project/structure/constants";
import { getImportCategory } from "#project/structure/utils/getImportCategory";
import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { Entity } from "#project/structure/types/Entity";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportEdge } from "#project/structure/types/ImportEdge";

// @debt repeats the environment grants `resolveImportRules` expands for the project maps; #227 renders the maps from these checks instead
const forbidden: Readonly<
  Partial<Record<Entity["environment"], readonly ImportCategory[]>>
> = freeze({
  src: freeze(["bin", "scripts", "tests"] as const),
  bin: freeze(["scripts", "tests"] as const),
  scripts: freeze(["bin", "tests"] as const),
  tooling: freeze(["bin", "scripts", "tests"] as const),
});

function isRootFile({ environment, lineage, path, role }: Entity): boolean {
  return (
    elementEnvironments.some((name) => name === environment) &&
    lineage.length === 1 &&
    lineage[0]?.path === path &&
    (role === indexRoleName || role === entryRoleName)
  );
}

export function checkEnvironments(
  edge: ImportEdge,
): BoundaryViolation | undefined {
  const { importer, target } = edge;

  if (importer === undefined) {
    return;
  }

  if (target !== undefined && isRootFile(target)) {
    return freeze({
      cause: "rootEntry",
      boundary: undefined,
      fix: undefined,
    });
  }

  const category = getImportCategory(edge);

  return category !== undefined &&
    forbidden[importer.environment]?.includes(category) === true
    ? freeze({
        cause: "environment",
        boundary: undefined,
        fix: undefined,
        category,
      })
    : undefined;
}
