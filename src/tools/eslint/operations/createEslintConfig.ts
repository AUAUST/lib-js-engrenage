import stylistic from "@stylistic/eslint-plugin";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";
// @debt reads the git section by resolving it again from the raw input, because the definer only has the project sections; a definer could receive the sections it reads through get
import type { Maybe, MaybeArray } from "@auaust/toolkit/types";

import { validate } from "#foundation/options/utils/validate";
import { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";
import { conventionCategories, pluginName } from "#tools/eslint/constants";
import { createConventionRules } from "#tools/eslint/operations/createConventionRules";
import { createPackageJsonRules } from "#tools/eslint/operations/createPackageJsonRules";
import { createRecommendedRules } from "#tools/eslint/operations/createRecommendedRules";
import { createIgnoreRules } from "#tools/eslint/utils/createIgnoreRules";
import { createImportPresets } from "#tools/eslint/utils/createImportPresets";
import { createPlugin } from "#tools/eslint/utils/createPlugin";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import { resolveGit } from "#tools/git/operations/resolveGit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Config } from "#tools/eslint/types/Config";
import type { Options } from "#tools/eslint/types/Options";

export function createEslintConfig(
  config: ProjectConfig,
  options?: Maybe<Options>,
): Config[] {
  const {
    ignore,
    recommended,
    packageJson: packageJsonEnabled,
    typeAware,
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
        typeAware,
      });
    },
  );

  const configs: MaybeArray<Config>[] = [];

  if (ignore) {
    configs.push(
      createIgnoreRules({
        gitignorePath: resolveGit(config.raw, {
          get: (section) => config[section],
        }).gitignore,
        generatedFiles: config.files.generated,
        outputDirectory: config.build.outDir,
        coverageDirectory: config.tests.coverageDir,
        fixtureFiles: config.files.fixtures,
      }),
    );
  }

  if (recommended) {
    configs.push(
      createRecommendedRules({
        config,
        typeAware,
      }),
    );
  }

  if (packageJsonEnabled) {
    configs.push(createPackageJsonRules());
  }

  if (categories.imports !== false) {
    configs.push(
      createImportPresets({
        codeFiles: config.typescript.files,
        tsconfig: config.typescript.tsconfig.path,
      }),
    );
  }

  return defineConfig(
    {
      name: `${pluginName}/plugins`,
      plugins: {
        [pluginName]: createPlugin(conventionCategories, config),
        "@stylistic": stylistic,
        "package-json": packageJson,
        perfectionist,
        unicorn,
        "unused-imports": unusedImports,
      },
    },
    typescriptConfigs.base,
    ...configs,
    resolveInfoRules(conventionRules),
  );
}
