import { wrap } from "@auaust/primitive-kit/arrays";

import { entryRoleName } from "#project/roles/constants";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getEntryFile({ roles }: ResolvedRoles): File | undefined {
  return wrap(roles[entryRoleName]?.file)[0];
}
