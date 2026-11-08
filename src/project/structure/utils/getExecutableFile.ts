import { executableRoleName } from "#project/roles/constants";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getExecutableFile({ roles }: ResolvedRoles): File | undefined {
  return listStaticFileGlobs(roles[executableRoleName]?.file)[0];
}
