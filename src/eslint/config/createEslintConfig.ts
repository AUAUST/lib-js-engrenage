import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";
import stylistic from "@stylistic/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";
import type { Maybe } from "@auaust/toolkit/types";

import { optionsSchema } from "#eslint/config/schemas/optionsSchema";
import { conventionCategories, pluginName } from "#eslint/constants";
import { createConventionRules } from "#eslint/utils/createConventionRules";
import { createIgnoreRules } from "#eslint/utils/createIgnoreRules";
import { createImportPresets } from "#eslint/utils/createImportPresets";
import { createPlugin } from "#eslint/utils/createPlugin";
import { createRecommendedRules } from "#eslint/utils/createRecommendedRules";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#eslint/types/Config";
import type { Options } from "#eslint/types/Options";

export function createEslintConfig(
  config: ResolvedConfig,
  options?: Maybe<Options>,
): Config[] {
  const { ignore, recommended, ...categories } = validate(
    optionsSchema,
    options ?? {},
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
        perfectionist,
        "unused-imports": unusedImports,
      },
    },
    typescriptConfigs.base,
    ignore
      ? createIgnoreRules({
          gitignorePath: config.gitignorePath,
          generatedFiles: config.files.generated,
          fixtureFiles: config.files.fixtures,
          testDirectories: config.directories.test,
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
