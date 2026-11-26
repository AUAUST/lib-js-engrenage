import { freeze } from "@auaust/toolkit/object";

import {
  entryRoleName,
  executableRoleName,
  indexRoleName,
} from "#batiment/roles/constants";
import { getImportCategory } from "#batiment/structure/utils/getImportCategory";
import { getLineageDirectory } from "#batiment/structure/utils/getLineageDirectory";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { Entity } from "#batiment/structure/types/Entity";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

function isRootFile(
  { namespace, lineage, path, role }: Entity,
  elements: ImportGrants["elements"],
): boolean {
  const directory = getLineageDirectory(lineage);

  return (
    namespace !== undefined &&
    elements.includes(namespace) &&
    directory !== undefined &&
    lineage.at(-1) === directory &&
    directory.path === path &&
    (role === indexRoleName || role === entryRoleName)
  );
}

function checkDirectories(
  { importer, target }: ImportEdge,
  directories: ImportGrants["directories"],
): BoundaryViolation | undefined {
  if (importer?.namespace === undefined || target?.namespace === undefined) {
    return;
  }

  const reached = directories[importer.namespace]?.[target.namespace];
  const directory = getLineageDirectory(target.lineage);

  return reached === undefined ||
    directory === undefined ||
    reached.includes(directory.path)
    ? undefined
    : freeze({
        cause: "namespaceDirectory",
        boundary: directory,
        fix: undefined,
        directories: reached,
      });
}

export function checkNamespaces(
  edge: ImportEdge,
  { namespaces, directories, elements, entries }: ImportGrants,
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

  if (
    category !== undefined &&
    importer.namespace !== undefined &&
    namespaces[importer.namespace]?.includes(category) === true
  ) {
    return freeze({
      cause: "namespace",
      boundary: undefined,
      fix: undefined,
      category,
    });
  }

  return checkDirectories(edge, directories);
}
