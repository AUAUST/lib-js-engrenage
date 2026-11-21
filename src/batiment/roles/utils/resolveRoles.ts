import { isFunction, isString } from "@auaust/toolkit";
import { entries, freeze, record, values } from "@auaust/toolkit/object";

import { defaultEffectLevels } from "#batiment/roles/constants";
import { registerRoles } from "#batiment/roles/utils/registerRoles";
import type { EffectModules } from "#batiment/roles/types/EffectModules";
import type { EnvironmentRoles } from "#batiment/roles/types/EnvironmentRoles";
import type { ResolvedEffects } from "#batiment/roles/types/ResolvedEffects";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#batiment/roles/types/ResolvedRoles";
import type { RoleEffects } from "#batiment/roles/types/RoleEffects";
import type { RoleRegistry } from "#batiment/roles/types/RoleRegistry";

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

// @debt `scopes` names the opt-in roles a namespace or structured role enables, as `StructureParent.scopes` and the structure resolvers do, colliding with the `batiment/scopes` scope tree the `optIn` rename cleared the flag from; `enabled` would match `roles.enable`
export function resolveRoles({
  environment,
  roles,
  effects,
  defaultModules,
  verbatimModuleSyntax,
  published,
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
    published,
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
    if (contract.optIn && !scopes.includes(name)) {
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
