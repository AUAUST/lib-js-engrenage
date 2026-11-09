import { isFunction } from "@auaust/toolkit/isFunction";
import { isString } from "@auaust/toolkit/isString";
import { entries, freeze, record, values } from "@auaust/toolkit/object";

import { defaultEffectLevels } from "#project/structure/constants";
import { registerRoles } from "#project/structure/utils/registerRoles";
import type { EffectModules } from "#project/structure/types/EffectModules";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";
import type { ResolvedEffects } from "#project/structure/types/ResolvedEffects";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEffects } from "#project/structure/types/RoleEffects";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";

function resolveEffects(
  effects: RoleEffects,
  environment: string,
  defaults: EffectModules | undefined,
): ResolvedEffects {
  const levels = effects.levels ?? defaultEffectLevels;

  const modules = [effects.modules, defaults].filter(
    (module) => module !== undefined,
  );

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
        if (isString(level)) {
          assertLevel(level, `The modules ${pattern}`);
        } else {
          assertLevel(level.default, `The modules ${pattern}`);

          for (const symbolLevel of values(level.symbols)) {
            assertLevel(symbolLevel, `The symbols of ${pattern}`);
          }
        }
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
  defaultModules,
  verbatimModuleSyntax,
  defined,
  scopes = [],
}: EnvironmentRoles & {
  environment: string;
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

  const resolvedEffects = resolveEffects(effects, environment, defaultModules);
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
