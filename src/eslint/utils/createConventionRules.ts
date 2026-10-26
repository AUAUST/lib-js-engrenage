import {
  every,
  flatMap,
  intersection,
  isNotEmpty,
  map,
} from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { entries } from "@auaust/toolkit/object";
import { value } from "@auaust/toolkit/value";

import { pluginName } from "#eslint/constants";
import { createRuleName } from "#eslint/utils/createRuleName";
import { filesIn } from "#eslint/utils/filesIn";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#eslint/types/Config";
import type { Convention } from "#eslint/types/Convention";
import type { Rules } from "#eslint/types/Rules";
import type { ScopeReference } from "#eslint/types/ScopeReference";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

function isEnabledByDefault(
  { enabled, presets, requires }: Convention,
  { presets: activePresets, environment }: ResolvedConfig,
): boolean {
  if (!enabled) {
    return false;
  }

  const hasRequiredPackages = every(requires, (name) => environment.has(name));

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

function resolveScopeReference(
  { files, directories }: ResolvedConfig,
  reference: ScopeReference,
): Globs {
  switch (reference) {
    case "files.code":
      return [files.code];
    case "files.test":
      return [files.test];
    case "files.config":
      return files.config;
    case "files.discovered":
      return files.discovered;
    case "directories.source":
      return map(directories.source, (directory) => {
        return filesIn(directory, files.code);
      });
    case "directories.test":
      return map(directories.test, (directory) => {
        return filesIn(directory, files.code);
      });
  }
}

function resolveScope(
  config: ResolvedConfig,
  references: ReadonlyArray<ScopeReference>,
): Glob[] {
  return flatMap(references, (reference) => {
    return resolveScopeReference(config, reference);
  });
}

function createRules(
  name: string,
  { rules, rule }: Convention,
  config: ResolvedConfig,
): Rules {
  const resolvedRules = value(rules, config);

  if (rule === undefined) {
    return resolvedRules;
  }

  return {
    ...resolvedRules,
    [`${pluginName}/${createRuleName(name)}`]: "error",
  };
}

export function createConventionRules({
  config,
  category,
  conventions,
  setting,
}: {
  config: ResolvedConfig;
  category: string;
  conventions: Record<string, Convention>;
  setting: boolean | Partial<Record<string, boolean>>;
}): Config[] {
  const configs: Config[] = [];

  for (const [name, convention] of entries(conventions)) {
    if (
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
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: config.root,
          },
        },
      }),
      rules: createRules(name, convention, config),
    });
  }

  return configs;
}
