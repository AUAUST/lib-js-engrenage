import { assign, entries, freeze, keys } from "@auaust/toolkit/object";

import { environmentRoleKeys, noRoles } from "#project/structure/constants";
import { resolveCatalogue } from "#project/structure/operations/resolveCatalogue";
import { resolveRoleContracts } from "#project/structure/operations/resolveRoleContracts";
import type { ProjectRoles } from "#project/structure/types/ProjectRoles";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { RolesOption } from "#project/structure/types/RolesOption";

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

  const contracts = resolveRoleContracts({
    catalogue: resolveCatalogue(),
    layers: [roles.define, environmentRoles.define],
  });

  const active = new Set<string>(environmentRoleKeys[environment]);
  const aliases: Record<string, string> = {};

  for (const option of [roles, environmentRoles]) {
    for (const name of option.enable) {
      active.add(name);
    }

    for (const name of option.disable) {
      active.delete(name);
    }

    for (const name of keys(option.define)) {
      active.add(name);
    }

    assign(aliases, option.aliases);
  }

  for (const name of scopes) {
    if (!(name in contracts)) {
      throw new Error(
        `The scope enables the role ${name}, which is not defined for ${environment}`,
      );
    }

    active.add(name);
  }

  const resolved: Record<string, ResolvedRoleContract> = {};

  for (const [name, contract] of entries(contracts)) {
    if (active.has(name) && (!contract.scoped || scopes.includes(name))) {
      resolved[name] = roles.verbatimModuleSyntax
        ? contract
        : freeze({ ...contract, typeOnly: false });
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
