import { freeze } from "@auaust/toolkit/object";

import {
  entryRoleName,
  executableRoleName,
  indexRoleName,
} from "#project/roles/constants";
import { getImportCategory } from "#project/structure/utils/getImportCategory";
import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { Entity } from "#project/structure/types/Entity";
import type { ImportEdge } from "#project/structure/types/ImportEdge";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

function isRootFile(
  { environment, lineage, path, role }: Entity,
  elements: ImportGrants["elements"],
): boolean {
  return (
    elements.includes(environment) &&
    lineage.length === 1 &&
    lineage[0]?.path === path &&
    (role === indexRoleName || role === entryRoleName)
  );
}

export function checkEnvironments(
  edge: ImportEdge,
  { environments, elements }: ImportGrants,
): BoundaryViolation | undefined {
  const { importer, target } = edge;

  if (importer === undefined) {
    return;
  }

  const isOwnExecutable =
    target !== undefined &&
    importer.role === executableRoleName &&
    importer.environment === target.environment &&
    importer.path === target.path;

  if (
    target !== undefined &&
    isRootFile(target, elements) &&
    !isOwnExecutable
  ) {
    return freeze({
      cause: "rootEntry",
      boundary: undefined,
      fix: undefined,
    });
  }

  const category = getImportCategory(edge);

  return category !== undefined &&
    environments[importer.environment]?.includes(category) === true
    ? freeze({
        cause: "environment",
        boundary: undefined,
        fix: undefined,
        category,
      })
    : undefined;
}
