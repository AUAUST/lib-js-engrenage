import { assign, entries, freeze } from "@auaust/toolkit/object";

import {
  environmentRoleKeys,
  noRoles,
  roleCatalogue,
} from "#project/structure/constants";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleContract } from "#project/structure/types/RoleContract";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { RolesOption } from "#project/structure/types/RolesOption";

export function resolveRoles({
  environment,
  roles,
  environmentRoles,
  // @debt `aliases` sits in the roles option and `scopes` is a flat list the caller must derive from the structure; #148 may place both differently
  scopes = [],
}: {
  environment: RoleEnvironment;
  roles: RolesOption | false | undefined;
  environmentRoles?: RolesOption | undefined;
  scopes?: readonly string[];
}): ResolvedRoles {
  if (roles === false) {
    return noRoles;
  }

  const contracts = new Map<string, RoleContract>(entries(roleCatalogue));
  const active = new Set<string>(environmentRoleKeys[environment]);
  const aliases: Record<string, string> = {};

  for (const option of [roles, environmentRoles]) {
    for (const name of option?.enable ?? []) {
      active.add(name);
    }

    for (const name of option?.disable ?? []) {
      active.delete(name);
    }

    for (const [name, contract] of entries(option?.define ?? {})) {
      contracts.set(name, contract);
      active.add(name);
    }

    assign(aliases, option?.aliases);
  }

  for (const name of scopes) {
    if (!contracts.has(name)) {
      throw new Error(
        `The scope enables the role ${name}, which is not defined for ${environment}`,
      );
    }

    active.add(name);
  }

  const resolved: Record<string, RoleContract> = {};

  for (const [name, contract] of contracts) {
    const scoped = contract.scoped === true;

    if (active.has(name) && (!scoped || scopes.includes(name))) {
      resolved[name] = contract;
    }
  }

  for (const [alias, target] of entries(aliases)) {
    if (!(target in resolved)) {
      throw new Error(
        `The alias ${alias} reads as ${target}, which is not an active role of ${environment}`,
      );
    }
  }

  return freeze({
    roles: freeze(resolved),
    aliases: freeze(aliases),
  });
}
