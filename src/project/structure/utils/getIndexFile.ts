import { indexRoleName } from "#project/roles/constants";
import { defaultIndexFile } from "#project/structure/constants";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getIndexFile({ roles }: ResolvedRoles): File {
  return listStaticFileGlobs(roles[indexRoleName]?.file)[0] ?? defaultIndexFile;
}
