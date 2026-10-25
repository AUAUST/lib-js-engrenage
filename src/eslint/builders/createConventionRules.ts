import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { pluginName } from "#eslint/constants";
import { createRuleName } from "#eslint/utils/createRuleName";
import { isConventionEnabled } from "#eslint/utils/isConventionEnabled";
import { resolveScopeReference } from "#eslint/utils/resolveScopeReference";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#eslint/types/Config";
import type { Convention } from "#eslint/types/Convention";
import type { Rules } from "#eslint/types/Rules";
import type { ScopeReference } from "#eslint/types/ScopeReference";
import type { Glob } from "#types/Glob";

function createRules(name: string, { rules, rule }: Convention): Rules {
  if (rule === undefined) {
    return rules;
  }

  return {
    ...rules,
    [`${pluginName}/${createRuleName(name)}`]: "error",
  };
}

function resolveScope(
  config: ResolvedConfig,
  references: ScopeReference[],
): Glob[] {
  return flatMap(references, (reference) => {
    return resolveScopeReference(config, reference);
  });
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
    if (!isConventionEnabled(name, convention, setting)) {
      continue;
    }

    const { scope, typeAware } = convention;

    configs.push({
      name: `${pluginName}/${category}/${name}`,
      files: resolveScope(config, scope.files),
      ignores: resolveScope(config, scope.ignores),
      ...(typeAware && {
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: config.root,
          },
        },
      }),
      rules: createRules(name, convention),
    });
  }

  return configs;
}
