import { entries, freeze, record } from "@auaust/toolkit/object";

import { registerRoles } from "#batiment/roles/utils/registerRoles";
import type { NamespaceRoles } from "#batiment/roles/types/NamespaceRoles";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#batiment/roles/types/ResolvedRoles";
import type { RoleRegistry } from "#batiment/roles/types/RoleRegistry";

// @debt `scopes` names the opt-in roles a namespace or structured role enables, as `StructureParent.scopes` and the structure resolvers do, colliding with the `batiment/scopes` scope tree the `optIn` rename cleared the flag from; `enabled` would match `roles.enable`
export function resolveRoles({
  namespace,
  roles,
  effects,
  typeImports,
  published,
  defined,
  scopes = [],
}: NamespaceRoles & {
  namespace: string;
  defined?: RoleRegistry;
  scopes?: readonly string[];
}): ResolvedRoles {
  const registry: RoleRegistry = {
    contracts: { ...defined?.contracts },
    aliases: { ...defined?.aliases },
  };

  registerRoles({
    owner: undefined,
    path: `${namespace}.roles`,
    roles,
    registry,
    published,
  });

  for (const name of scopes) {
    if (!(name in registry.contracts)) {
      throw new Error(
        `The scope enables the role ${name}, which is not defined for ${namespace}`,
      );
    }
  }

  const resolved: Record<string, ResolvedRoleContract> = {};

  for (const [name, contract] of entries(registry.contracts)) {
    if (contract.optIn && !scopes.includes(name)) {
      continue;
    }

    for (const [position, level] of entries(contract.effects)) {
      if (level !== undefined && !effects.levels.includes(level)) {
        throw new Error(
          `The role ${name} is ranked ${level} for its ${position}, which is not one of the effect levels of ${namespace}: ${effects.levels.join(", ")}`,
        );
      }
    }

    resolved[name] = typeImports
      ? contract
      : freeze({ ...contract, typeOnly: false });
  }

  const aliases = entries(registry.aliases).filter(([, target]) => {
    return target in resolved;
  });

  return freeze({
    roles: freeze(resolved),
    aliases: freeze(record(aliases)),
    effects,
  });
}
