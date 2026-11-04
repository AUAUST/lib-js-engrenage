import { wrap } from "@auaust/primitive-kit/arrays";

import { defaultIndexFile, indexRole } from "#project/structure/constants";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getIndexFile({ roles }: ResolvedRoles): File {
  return wrap(roles[indexRole]?.file)[0] ?? defaultIndexFile;
}
