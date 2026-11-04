import { every, intersection, isNotEmpty } from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { entries } from "@auaust/toolkit/object";
import { value } from "@auaust/toolkit/value";

import { pluginName } from "#tools/eslint/constants";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { createRuleName } from "#tools/eslint/utils/createRuleName";
import { createTypeAwareLanguageOptions } from "#tools/eslint/utils/createTypeAwareLanguageOptions";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { ConfigObject } from "#tools/eslint/types/ConfigObject";
import type { Convention } from "#tools/eslint/types/Convention";
import type { Rules } from "#tools/eslint/types/Rules";

function isEnabledByDefault(
  { enabled, presets, requires }: Convention,
  { presets: activePresets, environment }: ResolvedConfig,
): boolean {
  if (!enabled) {
    return false;
  }

  const hasRequiredPackages = every(requires, environment.hasDependency);

  if (!hasRequiredPackages) {
    return false;
  }

  if (presets.length === 0) {
    return true;
  }

  return isNotEmpty(intersection(presets, activePresets));
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
  config: ResolvedConfig;
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
  config: ResolvedConfig,
): Rules {
  const rules: Rules = {};

  for (const delegate of value(delegates, config)) {
    rules[delegate.upstream] = "off";

    rules[`${pluginName}/${delegate.name}`] = severity;
  }

  if (rule !== undefined) {
    rules[`${pluginName}/${createRuleName(name)}`] = severity;
  }

  return rules;
}

export function createConventionRules({
  config,
  category,
  conventions,
  setting,
  typeAware,
}: {
  config: ResolvedConfig;
  category: string;
  conventions: Record<string, Convention>;
  setting: boolean | Partial<Record<string, boolean>>;
  typeAware: boolean;
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
      rules: createRules(name, convention, config),
    });
  }

  return configs;
}
