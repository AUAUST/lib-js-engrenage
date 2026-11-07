import { matchesGlob } from "node:path";

import { wrap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { indexRoleName } from "#project/roles/constants";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import type { NamedFileRole } from "#project/structure/types/NamedFileRole";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

function matchesFile(name: string, { file }: ResolvedRoleContract) {
  return wrap(file ?? []).some((glob) => matchesGlob(name, glob));
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
  const nested = named.find(({ contract }) => matchesFile(name, contract));

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
    return matchesFile(name, contract);
  })?.[0];
}
