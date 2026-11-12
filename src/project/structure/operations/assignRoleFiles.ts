import { join } from "node:path";

import { values } from "@auaust/toolkit/object";

import { listStructureFiles } from "#project/structure/operations/listStructureFiles";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import { matchFileRole } from "#project/structure/utils/matchFileRole";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
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
