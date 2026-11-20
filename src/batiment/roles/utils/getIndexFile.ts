import { defaultIndexFile, indexRoleName } from "#batiment/roles/constants";
import { listStaticFileGlobs } from "#batiment/roles/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#batiment/roles/types/ResolvedRoles";
import type { File } from "#types/File";

export function getIndexFile({ roles }: ResolvedRoles): File {
  return listStaticFileGlobs(roles[indexRoleName]?.file)[0] ?? defaultIndexFile;
}
