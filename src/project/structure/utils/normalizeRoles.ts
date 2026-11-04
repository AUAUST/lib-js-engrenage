import { entries, freeze } from "@auaust/toolkit/object";

import { flattenRoleReferences } from "#project/structure/utils/flattenRoleReferences";
import type { DeclaredRolesOption } from "#project/structure/types/DeclaredRolesOption";
import type { RoleDefinition } from "#project/structure/types/RoleDefinition";
import type { RolesOption } from "#project/structure/types/RolesOption";

export function normalizeRoles(roles: DeclaredRolesOption): RolesOption {
  const define: Record<string, RoleDefinition> = {};

  for (const [name, contract] of entries(roles.define)) {
    define[name] = freeze({
      ...contract,
      roles:
        contract.roles === undefined
          ? undefined
          : flattenRoleReferences({
              owner: name,
              references: contract.roles,
              define,
            }),
    });
  }

  return freeze({
    enable: roles.enable,
    disable: roles.disable,
    define: freeze(define),
    aliases: roles.aliases,
    effects: roles.effects,
  });
}
