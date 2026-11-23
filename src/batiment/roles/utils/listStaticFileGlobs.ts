import { toArray } from "@auaust/toolkit/array";

import { isLocatedRoleFile } from "#batiment/roles/utils/isLocatedRoleFile";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";
import type { Globs } from "#types/Globs";

export function listStaticFileGlobs(file: ResolvedRoleContract["file"]): Globs {
  return file === undefined || isLocatedRoleFile(file) ? [] : toArray(file);
}
