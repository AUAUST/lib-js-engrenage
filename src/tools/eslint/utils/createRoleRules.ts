import type { Linter } from "eslint";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";
import { entries, values } from "@auaust/toolkit/object";

import { pluginName, rolesPluginName } from "#tools/eslint/constants";
import type { RoleRuleModule } from "#project/roles/index";
import type { EntityIndex, ResolvedStructure } from "#project/structure/index";
import type { Config } from "#tools/eslint/types/Config";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function createRoleRules(
  structure: ResolvedStructure,
  entities: EntityIndex,
): {
  readonly plugin: Plugin;
  readonly configs: readonly Config[];
} {
  const originals: Record<string, RoleRuleModule> = {};
  const wrapped = new Map<RoleRuleModule, RuleModule>();
  const modules: Record<string, RuleModule> = {};
  const configs: Config[] = [];

  function wrap(rule: RoleRuleModule): RuleModule {
    const existing = wrapped.get(rule);

    if (existing !== undefined) {
      return existing;
    }

    const module: RuleModule = {
      ...(rule.meta === undefined ? {} : { meta: rule.meta }),
      create(context) {
        const entity = entities.entityOf(context.filename);

        if (entity === undefined) {
          return {};
        }

        // @debt linear search by name because `Entity.environment` also names environments without a structure (`data`, `dist`, `workspace`); a typed lookup would index directly
        const environment = values(structure).find((candidate) => {
          return candidate?.name === entity.environment;
        });

        if (environment === undefined) {
          return {};
        }

        return rule.create(context, entity, {
          indexFile: environment.indexFile,
          entryFile: environment.entryFile,
        });
      },
    };

    wrapped.set(rule, module);

    return module;
  }

  for (const environment of values(structure)) {
    if (environment === undefined) {
      continue;
    }

    for (const [role, { contract, files, ignores }] of entries(
      environment.roles,
    )) {
      if (contract.rules === undefined || files.length === 0) {
        continue;
      }

      const rules: Linter.RulesRecord = {};

      for (const [key, rule] of entries(contract.rules)) {
        if (isArray(rule) || !isObject(rule)) {
          rules[key] = rule;

          continue;
        }

        const name = `${role}/${key}`;
        const registered = originals[name];

        if (registered !== undefined && registered !== rule) {
          throw new Error(
            `Several roles named ${role} define different rule modules as ${key}`,
          );
        }

        originals[name] = rule;
        modules[name] = wrap(rule);
        rules[`${rolesPluginName}/${name}`] = "error";
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
