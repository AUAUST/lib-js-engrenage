import { entryRoleName } from "#batiment/roles/constants";
import { listStaticFileGlobs } from "#batiment/roles/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#batiment/roles/types/ResolvedRoles";
import type { File } from "#types/File";

export function getEntryFile({ roles }: ResolvedRoles): File | undefined {
  return listStaticFileGlobs(roles[entryRoleName]?.file)[0];
}
