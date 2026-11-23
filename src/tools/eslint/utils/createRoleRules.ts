import type { Linter } from "eslint";

import { isFunction, isObject } from "@auaust/toolkit";
import { entries, getOwn, keys, values } from "@auaust/toolkit/object";

import { pluginName, rolesPluginName } from "#tools/eslint/constants";
import type { EntityIndex, ResolvedStructure } from "#batiment/structure/index";
import type { RoleRule } from "#tools/eslint/ports/RoleRule";
import type { Config } from "#tools/eslint/types/Config";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { RoleRuleLoaders } from "#tools/eslint/types/RoleRuleLoaders";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

function isRoleRule(value: unknown): value is RoleRule {
  return (
    isObject(value) &&
    "rule" in value &&
    isObject(value.rule) &&
    "create" in value.rule &&
    isFunction(value.rule.create)
  );
}

export async function createRoleRules(
  structure: ResolvedStructure,
  entities: EntityIndex,
  loaders: RoleRuleLoaders,
): Promise<{
  readonly plugin: Plugin;
  readonly configs: readonly Config[];
}> {
  const modules: Record<string, RuleModule> = {};
  const configs: Config[] = [];

  function wrap({ rule }: RoleRule): RuleModule {
    return {
      ...(rule.meta === undefined ? {} : { meta: rule.meta }),
      create(context) {
        const entity = entities.entityOf(context.filename);

        if (entity?.namespace === undefined) {
          return {};
        }

        const environment = getOwn(structure, entity.namespace);

        if (environment === undefined) {
          return {};
        }

        return rule.create(context, entity, {
          indexFile: environment.indexFile,
          entryFile: environment.entryFile,
        });
      },
    };
  }

  async function register(role: string, key: string): Promise<string> {
    const name = `${role}/${key}`;

    if (modules[name] === undefined) {
      const loaded: unknown = await getOwn(loaders, role)?.[key]?.();

      if (!isRoleRule(loaded)) {
        throw new Error(
          `The role rule ${name} loads no rule; create it with defineRoleRule`,
        );
      }

      modules[name] = wrap(loaded);
    }

    return `${rolesPluginName}/${name}`;
  }

  for (const environment of values(structure)) {
    if (environment === undefined) {
      continue;
    }

    for (const [role, { contract, files, ignores }] of entries(
      environment.roles,
    )) {
      const ruleKeys = keys(getOwn(loaders, role) ?? {});

      if (
        (contract.rules === undefined && ruleKeys.length === 0) ||
        files.length === 0
      ) {
        continue;
      }

      const rules: Linter.RulesRecord = { ...contract.rules };

      for (const key of ruleKeys) {
        rules[await register(role, key)] = "error";
      }

      configs.push({
        name: `${pluginName}/roles/${environment.name}/${role}`,
        files: [...files],
        ignores: [...ignores],
        rules,
      });
    }
  }

  return {
    plugin: { rules: modules },
    configs,
  };
}
