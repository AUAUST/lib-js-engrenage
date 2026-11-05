import { isFunction } from "@auaust/toolkit/isFunction";
import { assign, entries, freeze, keys } from "@auaust/toolkit/object";

import {
  defaultEffectLevels,
  environmentRoleKeys,
  noRoles,
  publishedRoleKeys,
} from "#project/structure/constants";
import { resolveCatalogue } from "#project/structure/utils/resolveCatalogue";
import { resolveRoleContracts } from "#project/structure/utils/resolveRoleContracts";
import type { ProjectRoles } from "#project/structure/types/ProjectRoles";
import type { ResolvedEffects } from "#project/structure/types/ResolvedEffects";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { RolesOption } from "#project/structure/types/RolesOption";

function resolveEffects(
  roles: RolesOption,
  environmentRoles: RolesOption,
  environment: RoleEnvironment,
): ResolvedEffects {
  const levels =
    environmentRoles.effects.levels ??
    roles.effects.levels ??
    defaultEffectLevels;

  const modules = [
    environmentRoles.effects.modules,
    roles.effects.modules,
  ].filter((ranking) => ranking !== undefined);

  const fallback = environmentRoles.effects.fallback ?? roles.effects.fallback;

  function assertLevel(level: string, subject: string) {
    if (!levels.includes(level)) {
      throw new Error(
        `${subject} is ranked ${level}, which is not one of the effect levels of ${environment}: ${levels.join(", ")}`,
      );
    }
  }

  if (fallback !== undefined) {
    assertLevel(fallback, "The fallback");
  }

  for (const ranking of modules) {
    if (!isFunction(ranking)) {
      for (const [pattern, level] of entries(ranking)) {
        assertLevel(level, `The modules ${pattern}`);
      }
    }
  }

  return freeze({
    levels,
    modules,
    fallback,
  });
}

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

  const active = new Set<string>([
    ...environmentRoleKeys[environment],
    ...(roles.published && environment in publishedRoleKeys
      ? publishedRoleKeys[environment as keyof typeof publishedRoleKeys]
      : []),
  ]);

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

  const effects = resolveEffects(roles, environmentRoles, environment);
  const resolved: Record<string, ResolvedRoleContract> = {};

  for (const [name, contract] of entries(contracts)) {
    if (!(active.has(name) && (!contract.scoped || scopes.includes(name)))) {
      continue;
    }

    if (
      contract.effects !== undefined &&
      !effects.levels.includes(contract.effects)
    ) {
      throw new Error(
        `The role ${name} is ranked ${contract.effects}, which is not one of the effect levels of ${environment}: ${effects.levels.join(", ")}`,
      );
    }

    resolved[name] = roles.verbatimModuleSyntax
      ? contract
      : freeze({ ...contract, typeOnly: false });
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
    effects,
  });
}
