import { isFunction } from "@auaust/toolkit/isFunction";
import { entries, freeze, record } from "@auaust/toolkit/object";

import { defaultEffectLevels } from "#project/structure/constants";
import { registerRoles } from "#project/structure/utils/registerRoles";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";
import type { ResolvedEffects } from "#project/structure/types/ResolvedEffects";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEffects } from "#project/structure/types/RoleEffects";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";

function resolveEffects(
  effects: RoleEffects,
  environment: RoleEnvironment,
): ResolvedEffects {
  const levels = effects.levels ?? defaultEffectLevels;
  const modules = effects.modules === undefined ? [] : [effects.modules];
  const { fallback } = effects;

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
  effects,
  verbatimModuleSyntax,
  defined,
  scopes = [],
}: EnvironmentRoles & {
  environment: RoleEnvironment;
  defined?: RoleRegistry;
  scopes?: readonly string[];
}): ResolvedRoles {
  const registry: RoleRegistry = {
    contracts: { ...defined?.contracts },
    aliases: { ...defined?.aliases },
  };

  registerRoles({
    owner: undefined,
    path: `${environment}.roles`,
    roles,
    registry,
  });

  for (const name of scopes) {
    if (!(name in registry.contracts)) {
      throw new Error(
        `The scope enables the role ${name}, which is not defined for ${environment}`,
      );
    }
  }

  const resolvedEffects = resolveEffects(effects, environment);
  const resolved: Record<string, ResolvedRoleContract> = {};

  for (const [name, contract] of entries(registry.contracts)) {
    if (contract.scoped && !scopes.includes(name)) {
      continue;
    }

    if (
      contract.effects !== undefined &&
      !resolvedEffects.levels.includes(contract.effects)
    ) {
      throw new Error(
        `The role ${name} is ranked ${contract.effects}, which is not one of the effect levels of ${environment}: ${resolvedEffects.levels.join(", ")}`,
      );
    }

    resolved[name] = verbatimModuleSyntax
      ? contract
      : freeze({ ...contract, typeOnly: false });
  }

  const aliases = entries(registry.aliases).filter(([, target]) => {
    return target in resolved;
  });

  return freeze({
    roles: freeze(resolved),
    aliases: freeze(record(aliases)),
    effects: resolvedEffects,
  });
}
