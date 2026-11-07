import { wrap } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

export function listStaticFileGlobs(file: ResolvedRoleContract["file"]): Globs {
  return isString(file) || isArray(file) ? wrap(file) : [];
}
