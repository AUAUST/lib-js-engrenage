import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import { createConventionRules } from "#eslint/builders/createConventionRules";
import { createIgnoreRules } from "#eslint/builders/createIgnoreRules";
import { createImportPresets } from "#eslint/builders/createImportPresets";
import { createPlugin } from "#eslint/builders/createPlugin";
import { createRecommendedRules } from "#eslint/builders/createRecommendedRules";
import { optionsSchema } from "#eslint/config/schemas/optionsSchema";
import { conventionCategories } from "#eslint/constants/conventionCategories";
import { pluginName } from "#eslint/constants/pluginName";
import type { Config } from "#eslint/types/Config";
import type { Options } from "#eslint/types/Options";
import { validate } from "#support/validation/utils/validate";
import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

export function createEslintConfig(
  config: ResolvedConfig,
  options: Options = {},
): Config[] {
  const { ignore, recommended, ...categories } = validate(
    optionsSchema,
    options,
    "ESLint options",
  );

  const conventionRules = flatMap(
    entries(conventionCategories),
    ([category, conventions]) => {
      return createConventionRules({
        config,
        category,
        conventions,
        setting: categories[category],
      });
    },
  );

  return defineConfig([
    {
      name: `${pluginName}/plugins`,
      plugins: {
        [pluginName]: createPlugin(conventionCategories),
        "@stylistic": stylistic,
      },
    },
    typescriptConfigs.base,
    ignore
      ? createIgnoreRules({
          root: config.root,
          gitignore: config.files.gitignore,
          generatedFiles: config.files.generated,
        })
      : [],
    recommended
      ? createRecommendedRules({
          codeFiles: config.files.code,
        })
      : [],
    categories.imports === false
      ? []
      : createImportPresets({
          codeFiles: config.files.code,
        }),
    conventionRules,
  ]);
}
