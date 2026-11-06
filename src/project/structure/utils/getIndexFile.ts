import { wrap } from "@auaust/primitive-kit/arrays";

import { indexRoleName } from "#project/roles/constants";
import { defaultIndexFile } from "#project/structure/constants";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getIndexFile({ roles }: ResolvedRoles): File {
  return wrap(roles[indexRoleName]?.file)[0] ?? defaultIndexFile;
}
