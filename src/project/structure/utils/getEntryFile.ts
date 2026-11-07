import { entryRoleName } from "#project/roles/constants";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getEntryFile({ roles }: ResolvedRoles): File | undefined {
  return listStaticFileGlobs(roles[entryRoleName]?.file)[0];
}
