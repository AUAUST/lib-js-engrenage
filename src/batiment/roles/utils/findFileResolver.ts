import { isString } from "@auaust/toolkit";

import type { RoleFileResolver } from "#batiment/roles/types/RoleFileResolver";
import type { DescribedResolver } from "#foundation/options/index";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function findFileResolver(
  file: Glob | Globs | DescribedResolver<RoleFileResolver> | undefined,
): DescribedResolver<RoleFileResolver> | undefined {
  return file == null || isString(file) || !("resolve" in file)
    ? undefined
    : file;
}
