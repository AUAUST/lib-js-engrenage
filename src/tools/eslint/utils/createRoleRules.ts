import type { Linter } from "eslint";

import { isArray } from "@auaust/toolkit/isArray";
import { isNumber } from "@auaust/toolkit/isNumber";
import { isString } from "@auaust/toolkit/isString";
import { entries, getOwn, values } from "@auaust/toolkit/object";

import { pluginName, rolesPluginName } from "#tools/eslint/constants";
import type { RoleRuleModule } from "#project/roles/index";
import type { EntityIndex, ResolvedStructure } from "#project/structure/index";
import type { RoleRule } from "#tools/eslint/ports/RoleRule";
import type { Config } from "#tools/eslint/types/Config";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

function isRoleRule(module: RoleRuleModule): module is RoleRule {
  return module.tool === "eslint" && "rule" in module;
}

export async function createRoleRules(
  structure: ResolvedStructure,
  entities: EntityIndex,
): Promise<{
  readonly plugin: Plugin;
  readonly configs: readonly Config[];
}> {
  const originals: Record<string, RoleRule> = {};
  const wrapped = new Map<RoleRule, RuleModule>();
  const modules: Record<string, RuleModule> = {};
  const configs: Config[] = [];

  function wrap(roleRule: RoleRule): RuleModule {
    const existing = wrapped.get(roleRule);

    if (existing !== undefined) {
      return existing;
    }

    const { rule } = roleRule;

    const module: RuleModule = {
      ...(rule.meta === undefined ? {} : { meta: rule.meta }),
      create(context) {
        const entity = entities.entityOf(context.filename);

        if (entity === undefined) {
          return {};
        }

        const environment = getOwn(structure, entity.environment);

        if (environment === undefined) {
          return {};
        }

        return rule.create(context, entity, {
          indexFile: environment.indexFile,
          entryFile: environment.entryFile,
        });
      },
    };

    wrapped.set(roleRule, module);

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

      for (const [key, entry] of entries(contract.rules)) {
        if (isArray(entry) || isString(entry) || isNumber(entry)) {
          rules[key] = entry;

          continue;
        }

        const rule = "tool" in entry ? entry : await entry();

        if (!isRoleRule(rule)) {
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
