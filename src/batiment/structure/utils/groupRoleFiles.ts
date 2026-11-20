import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";

// @debt `getStructureCardinality` groups the same assignments by role again; it could take these groups instead
export function groupRoleFiles(
  assigned: readonly (readonly [File, string | undefined])[],
): Readonly<Record<string, readonly File[]>> {
  const grouped: Record<string, File[]> = {};

  for (const [file, role] of assigned) {
    if (role !== undefined) {
      (grouped[role] ??= []).push(file);
    }
  }

  return freeze(grouped);
}
