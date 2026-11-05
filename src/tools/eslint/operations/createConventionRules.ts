import { every, find } from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { entries } from "@auaust/toolkit/object";
import { value } from "@auaust/toolkit/value";

import { pluginName } from "#tools/eslint/constants";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { createRuleName } from "#tools/eslint/utils/createRuleName";
import { createTypeAwareLanguageOptions } from "#tools/eslint/utils/createTypeAwareLanguageOptions";
import type { ProjectConfig } from "#project/config/index";
import type { ConfigObject } from "#tools/eslint/types/ConfigObject";
import type { Convention } from "#tools/eslint/types/Convention";
import type { Rules } from "#tools/eslint/types/Rules";

function isEnabledByDefault(
  { enabled, traits, requires }: Convention,
  { traits: activeTraits, environment }: ProjectConfig,
): boolean {
  if (!enabled) {
    return false;
  }

  const hasRequiredPackages = every(requires, environment.hasDependency);

  if (!hasRequiredPackages) {
    return false;
  }

  if (traits.length === 0) {
    return true;
  }

  return find(traits, (trait) => activeTraits[trait]) !== undefined;
}

function isEnabled({
  name,
  convention,
  setting,
  config,
}: {
  name: string;
  convention: Convention;
  setting: boolean | Partial<Record<string, boolean>>;
  config: ProjectConfig;
}): boolean {
  if (setting === false) {
    return false;
  }

  const enabledByDefault = isEnabledByDefault(convention, config);

  if (isBoolean(setting)) {
    return enabledByDefault;
  }

  return setting[name] ?? enabledByDefault;
}

function createRules(
  name: string,
  { delegates, rule, severity }: Convention,
  config: ProjectConfig,
  options: unknown,
): Rules {
  const rules: Rules = {};

  for (const delegate of value(delegates, config)) {
    rules[delegate.upstream] = "off";

    rules[`${pluginName}/${delegate.name}`] = severity;
  }

  if (rule !== undefined) {
    rules[`${pluginName}/${createRuleName(name)}`] =
      options === undefined ? severity : [severity, options];
  }

  return rules;
}

export function createConventionRules({
  config,
  category,
  conventions,
  setting,
  typeAware,
  ruleOptions = {},
}: {
  config: ProjectConfig;
  category: string;
  conventions: Record<string, Convention>;
  setting: boolean | Partial<Record<string, boolean>>;
  typeAware: boolean;
  ruleOptions?: Readonly<Record<string, unknown>>;
}): ConfigObject[] {
  const configs: ConfigObject[] = [];

  for (const [name, convention] of entries(conventions)) {
    if (
      (convention.typeAware && !typeAware) ||
      !isEnabled({
        name,
        convention,
        setting,
        config,
      })
    ) {
      continue;
    }

    configs.push({
      name: `${pluginName}/${category}/${name}`,
      files: resolveScope(config, convention.files),
      ignores: resolveScope(config, convention.ignores),
      ...(convention.typeAware && {
        languageOptions: createTypeAwareLanguageOptions(config),
      }),
      rules: createRules(name, convention, config, ruleOptions[name]),
    });
  }

  return configs;
}
