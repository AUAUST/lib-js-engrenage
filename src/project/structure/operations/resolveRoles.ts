import { assign, entries, freeze } from "@auaust/toolkit/object";

import { environmentRoleKeys, noRoles } from "#structure/constants";
import { resolveCatalogue } from "#structure/operations/resolveCatalogue";
import type { ProjectRoles } from "#structure/types/ProjectRoles";
import type { ResolvedRoleContract } from "#structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#structure/types/RoleEnvironment";
import type { RolesOption } from "#structure/types/RolesOption";

export function resolveRoles({
  environment,
  roles,
  environmentRoles,
  scopes = [],
}: {
  environment: RoleEnvironment;
  roles: ProjectRoles;
  environmentRoles: RolesOption;
  scopes?: readonly string[];
}): ResolvedRoles {
  if (!roles.enabled) {
    return noRoles;
  }

  const contracts = new Map<string, ResolvedRoleContract>(
    entries(resolveCatalogue()),
  );

  const active = new Set<string>(environmentRoleKeys[environment]);
  const aliases: Record<string, string> = {};

  for (const option of [roles, environmentRoles]) {
    for (const name of option.enable) {
      active.add(name);
    }

    for (const name of option.disable) {
      active.delete(name);
    }

    for (const [name, contract] of entries(option.define)) {
      contracts.set(name, contract);
      active.add(name);
    }

    assign(aliases, option.aliases);
  }

  for (const name of scopes) {
    if (!contracts.has(name)) {
      throw new Error(
        `The scope enables the role ${name}, which is not defined for ${environment}`,
      );
    }

    active.add(name);
  }

  const resolved: Record<string, ResolvedRoleContract> = {};

  for (const [name, contract] of contracts) {
    if (active.has(name) && (!contract.scoped || scopes.includes(name))) {
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
