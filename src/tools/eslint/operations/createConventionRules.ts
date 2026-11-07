import { map } from "@auaust/primitive-kit/arrays";

import { pluginName } from "#tools/eslint/constants";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { createRuleName } from "#tools/eslint/utils/createRuleName";
import { createTypeAwareLanguageOptions } from "#tools/eslint/utils/createTypeAwareLanguageOptions";
import type { ConfigContext } from "#project/config/index";
import type { ConfigObject } from "#tools/eslint/types/ConfigObject";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";
import type { Rules } from "#tools/eslint/types/Rules";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";
import type { SelectedConvention } from "#tools/eslint/types/SelectedConvention";

function createRules(
  { name, convention: { delegates, rule, severity } }: SelectedConvention,
  sections: ResolvedSections,
  context: ConfigContext,
): Rules {
  const rules: Rules = {};

  for (const delegate of delegates(sections, context)) {
    rules[delegate.upstream] = "off";

    rules[`${pluginName}/${delegate.name}`] = severity;
  }

  if (rule !== undefined) {
    rules[`${pluginName}/${createRuleName(name)}`] = severity;
  }

  return rules;
}

export function createConventionRules({
  selected,
  sections,
  scopes,
  context,
}: {
  selected: readonly SelectedConvention[];
  sections: ResolvedSections;
  scopes: ScopeSources;
  context: ConfigContext;
}): ConfigObject[] {
  return map(selected, (entry) => {
    const { category, name, convention } = entry;

    return {
      name: `${pluginName}/${category}/${name}`,
      files: resolveScope(scopes, convention.files),
      ignores: resolveScope(scopes, convention.ignores),
      ...(convention.typeAware && {
        languageOptions: createTypeAwareLanguageOptions(context.root),
      }),
      rules: createRules(entry, sections, context),
    };
  });
}
