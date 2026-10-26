import stylistic from "@stylistic/eslint-plugin";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";
import type { Maybe, MaybeArray } from "@auaust/toolkit/types";

import { optionsSchema } from "#eslint/config/schemas/optionsSchema";
import { conventionCategories, pluginName } from "#eslint/constants";
import { createConventionRules } from "#eslint/utils/createConventionRules";
import { createIgnoreRules } from "#eslint/utils/createIgnoreRules";
import { createImportPresets } from "#eslint/utils/createImportPresets";
import { createPackageJsonRules } from "#eslint/utils/createPackageJsonRules";
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
  const {
    ignore,
    recommended,
    packageJson: packageJsonEnabled,
    ...categories
  } = validate(optionsSchema, options ?? {}, "ESLint options");

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

  const configs: MaybeArray<Config>[] = [];

  if (ignore) {
    configs.push(
      createIgnoreRules({
        gitignorePath: config.gitignorePath,
        generatedFiles: config.files.generated,
        outputDirectory: config.directories.output,
        coverageDirectory: config.directories.coverage,
        fixtureFiles: config.files.fixtures,
      }),
    );
  }

  if (recommended) {
    configs.push(
      createRecommendedRules({
        codeFiles: config.files.code,
      }),
    );
  }

  if (packageJsonEnabled) {
    configs.push(createPackageJsonRules());
  }

  if (categories.imports !== false) {
    configs.push(
      createImportPresets({
        codeFiles: config.files.code,
      }),
    );
  }

  return defineConfig(
    {
      name: `${pluginName}/plugins`,
      plugins: {
        [pluginName]: createPlugin(conventionCategories),
        "@stylistic": stylistic,
        "package-json": packageJson,
        perfectionist,
        "unused-imports": unusedImports,
      },
    },
    typescriptConfigs.base,
    ...configs,
    conventionRules,
  );
}
