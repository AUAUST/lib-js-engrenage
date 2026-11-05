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

import { validate, type OptionContext } from "#foundation/options/index";
import { conventionCategories } from "#tools/eslint/config/conventionCategories";
import { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";
import { pluginName } from "#tools/eslint/constants";
import { createConventionRules } from "#tools/eslint/operations/createConventionRules";
import { createPackageJsonRules } from "#tools/eslint/operations/createPackageJsonRules";
import { createRecommendedRules } from "#tools/eslint/operations/createRecommendedRules";
import { resolveConventionConfig } from "#tools/eslint/operations/resolveConventionConfig";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { createBoundaryRuleOptions } from "#tools/eslint/utils/createBoundaryRuleOptions";
import { createIgnoreRules } from "#tools/eslint/utils/createIgnoreRules";
import { createImportPresets } from "#tools/eslint/utils/createImportPresets";
import { createPlugin } from "#tools/eslint/utils/createPlugin";
import { resolveBoundaries } from "#tools/eslint/utils/resolveBoundaries";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import { resolveGit } from "#tools/git/index";
import type { ProjectConfig } from "#project/config/index";
import type { Config } from "#tools/eslint/types/Config";
import type { Options } from "#tools/eslint/types/Options";

export async function createEslintConfig(
  context: OptionContext<ProjectConfig>,
  options?: Maybe<Options>,
): Promise<Config[]> {
  const config = await resolveConventionConfig(context);

  const {
    ignore,
    recommended,
    packageJson: packageJsonEnabled,
    typeAware,
    boundaries,
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
        ruleOptions:
          category === "structure" ? createBoundaryRuleOptions(boundaries) : {},
      });
    },
  );

  const configs: MaybeArray<Config>[] = [];

  if (ignore) {
    const git = await resolveGit(config.raw, context);

    configs.push(
      createIgnoreRules({
        gitignorePath: await git.gitignore,
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

  if (categories.structure !== false) {
    configs.push({
      name: `${pluginName}/boundaries`,
      files: resolveScope(config, ["files.code"]),
      settings: resolveBoundaries(config).settings,
    });
  }

  if (categories.imports !== false) {
    configs.push(
      createImportPresets({
        codeFiles: resolveScope(config, ["files.code"]),
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
    {
      files: resolveScope(config, ["files.code"]),
      extends: [typescriptConfigs.base],
    },
    ...configs,
    resolveInfoRules(conventionRules),
  );
}
