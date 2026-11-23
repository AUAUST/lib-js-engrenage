import { freeze } from "@auaust/toolkit/object";

import {
  entryRoleName,
  executableRoleName,
  indexRoleName,
} from "#batiment/roles/constants";
import { getImportCategory } from "#batiment/structure/utils/getImportCategory";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { Entity } from "#batiment/structure/types/Entity";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

function isRootFile(
  { namespace, lineage, path, role }: Entity,
  elements: ImportGrants["elements"],
): boolean {
  return (
    namespace !== undefined &&
    elements.includes(namespace) &&
    lineage.length === 1 &&
    lineage[0]?.path === path &&
    (role === indexRoleName || role === entryRoleName)
  );
}

export function checkNamespaces(
  edge: ImportEdge,
  { namespaces, elements, entries }: ImportGrants,
): BoundaryViolation | undefined {
  const { importer, target } = edge;

  if (importer === undefined) {
    return;
  }

  const isOwnExecutable = (
    target !== undefined &&
    importer.role === executableRoleName &&
    importer.namespace === target.namespace &&
    importer.path === target.path
  );

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

  const category = getImportCategory(edge, entries);

  return category !== undefined &&
    importer.namespace !== undefined &&
    namespaces[importer.namespace]?.includes(category) === true
    ? freeze({
        cause: "namespace",
        boundary: undefined,
        fix: undefined,
        category,
      })
    : undefined;
}
