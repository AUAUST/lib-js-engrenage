import type { Linter } from "eslint";
import type { defineConfig } from "eslint/config";

import { map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { entries } from "@auaust/toolkit/object";

import { infoRulesSetting } from "#eslint/constants";
import type { ConfigObject } from "#eslint/types/ConfigObject";
import type { ConfigWithExtends } from "#eslint/types/ConfigWithExtends";
import type { Rule } from "#eslint/types/Rule";
import type { Rules } from "#eslint/types/Rules";

function isInfo(rule: Rule): boolean {
  return rule === "info" || (isArray(rule) && rule[0] === "info");
}

function toEslintRule(rule: Rule): Linter.RuleEntry {
  if (rule === "info") {
    return "warn";
  }

  if (isArray(rule) && rule[0] === "info") {
    return ["warn", ...rule.slice(1)];
  }

  return rule;
}

function resolveConfigObject({ rules, ...config }: ConfigObject) {
  if (rules === undefined) {
    return config;
  }

  const eslintRules: Linter.RulesRecord = {};

  const infoRules: string[] = [];

  for (const [name, rule] of entries<Rules>(rules)) {
    if (rule === undefined) {
      continue;
    }

    eslintRules[name] = toEslintRule(rule);

    if (isInfo(rule)) {
      infoRules.push(name);
    }
  }

  return {
    ...config,
    rules: eslintRules,
    ...(infoRules.length > 0 && {
      settings: {
        ...config.settings,
        [infoRulesSetting]: infoRules,
      },
    }),
  };
}

export function resolveInfoRules(
  config: ConfigWithExtends,
): Parameters<typeof defineConfig>[number] {
  if (isArray(config)) {
    return map(config, resolveInfoRules);
  }

  return resolveConfigObject(config);
}
