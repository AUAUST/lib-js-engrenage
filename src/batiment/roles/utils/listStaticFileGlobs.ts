import { isArray, isString } from "@auaust/toolkit";
import { toArray } from "@auaust/toolkit/array";

import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

export function listStaticFileGlobs(file: ResolvedRoleContract["file"]): Globs {
  return isString(file) || isArray(file) ? toArray(file) : [];
}
