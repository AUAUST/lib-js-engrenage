import type { Linter } from "eslint";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";
import { entries, values } from "@auaust/toolkit/object";

import { pluginName, rolesPluginName } from "#tools/eslint/constants";
import type { ResolvedStructure } from "#project/structure/index";
import type { Config } from "#tools/eslint/types/Config";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function createRoleRules(structure: ResolvedStructure): {
  readonly plugin: Plugin;
  readonly configs: readonly Config[];
} {
  const modules: Record<string, RuleModule> = {};
  const configs: Config[] = [];

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
        const registered = modules[name];

        if (registered !== undefined && registered !== rule) {
          throw new Error(
            `Several roles named ${role} define different rule modules as ${key}`,
          );
        }

        modules[name] = rule;
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
