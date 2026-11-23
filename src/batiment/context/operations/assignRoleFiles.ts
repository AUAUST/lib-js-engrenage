import { join } from "node:path";

import { values } from "@auaust/toolkit/object";

import { listStructureFiles } from "#batiment/context/operations/listStructureFiles";
import { listStaticFileGlobs, type ResolvedRoles } from "#batiment/roles/index";
import { matchFileRole } from "#batiment/structure/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function assignRoleFiles(
  filesystem: Filesystem,
  path: Directory,
  roles: ResolvedRoles,
): Promise<(readonly [File, string | undefined])[]> {
  const fileGlobs = values(roles.roles).flatMap(({ file }) => {
    return listStaticFileGlobs(file);
  });

  if (fileGlobs.length === 0) {
    return [];
  }

  const files = await listStructureFiles(filesystem, path);

  return files.map((file) => {
    return [
      join(path, file),
      matchFileRole(file, {
        named: [],
        enclosing: undefined,
        roles,
      }),
    ] as const;
  });
}
