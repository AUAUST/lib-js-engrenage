import { matchesGlob } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { indexRoleName } from "#batiment/roles/constants";
import {
  getIndexFile,
  listStaticFileGlobs,
  type ResolvedRoles,
} from "#batiment/roles/index";
import type { NamedFileRole } from "#batiment/structure/types/NamedFileRole";
import type { Globs } from "#types/Globs";

function matchesAny(name: string, globs: Globs) {
  return globs.some((glob) => matchesGlob(name, glob));
}

export function matchFileRole(
  name: string,
  {
    named,
    enclosing,
    roles,
  }: {
    named: readonly NamedFileRole[];
    enclosing: string | undefined;
    roles: ResolvedRoles | undefined;
  },
): string | undefined {
  const nested = named.find(({ globs }) => matchesAny(name, globs));

  if (nested !== undefined) {
    return nested.name;
  }

  if (enclosing !== undefined) {
    return enclosing;
  }

  if (roles === undefined) {
    return;
  }

  if (name === getIndexFile(roles)) {
    return indexRoleName;
  }

  return entries(roles.roles).find(([, contract]) => {
    return matchesAny(name, listStaticFileGlobs(contract.file));
  })?.[0];
}
