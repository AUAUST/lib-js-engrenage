import { wrap } from "@auaust/primitive-kit/arrays";

import { entryRole } from "#project/structure/constants";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { File } from "#types/File";

export function getEntryFile({ roles }: ResolvedRoles): File | undefined {
  return wrap(roles[entryRole]?.file)[0];
}
