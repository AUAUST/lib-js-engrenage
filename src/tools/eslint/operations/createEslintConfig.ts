import stylistic from "@stylistic/eslint-plugin";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import type { Maybe, MaybeArray } from "@auaust/toolkit/types";

import { validate } from "#foundation/options/index";
import { listLocationGlobs, type LoadedConfig } from "#project/config/index";
import { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";
import { pluginName, rolesPluginName } from "#tools/eslint/constants";
import { createConventionRules } from "#tools/eslint/operations/createConventionRules";
import { createPackageJsonRules } from "#tools/eslint/operations/createPackageJsonRules";
import { createRecommendedRules } from "#tools/eslint/operations/createRecommendedRules";
import { resolveConventionSections } from "#tools/eslint/operations/resolveConventionSections";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { resolveScopeSources } from "#tools/eslint/operations/resolveScopeSources";
import { selectConventions } from "#tools/eslint/operations/selectConventions";
import { createIgnoreRules } from "#tools/eslint/utils/createIgnoreRules";
import { createImportPresets } from "#tools/eslint/utils/createImportPresets";
import { createPlugin } from "#tools/eslint/utils/createPlugin";
import { createRoleRules } from "#tools/eslint/utils/createRoleRules";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import type { Config } from "#tools/eslint/types/Config";
import type { Options } from "#tools/eslint/types/Options";

import * as conventionCategories from "#tools/eslint/conventions/index";

export async function createEslintConfig(
  config: LoadedConfig,
  options?: Maybe<Options>,
): Promise<Config[]> {
  const { context } = config;

  const {
    ignore,
    recommended,
    packageJson: packageJsonEnabled,
    typeAware,
    ...categories
  } = validate(optionsSchema, options ?? {}, "ESLint options");

  const [scopes, traits, environment] = await Promise.all([
    resolveScopeSources(config),
    config.resolve("traits"),
    config.resolve("environment"),
  ]);

  const selected = selectConventions({
    categories: conventionCategories,
    settings: categories,
    typeAware,
    traits,
    environment,
  });

  const sections = await resolveConventionSections(
    config,
    map(selected, ({ convention }) => convention),
  );

  const conventionRules = createConventionRules({
    selected,
    sections,
    scopes,
    context,
  });

  const configs: MaybeArray<Config>[] = [];

  if (ignore) {
    const resources = await config.resolve("resources");

    const uncommitted = resources.list().filter(({ committed }) => {
      return !committed;
    });

    configs.push(
      createIgnoreRules({
        gitignorePath:
          resources.get("gitignore") === undefined
            ? undefined
            : resources.path("gitignore"),
        ignored: [
          ...flatMap(uncommitted, ({ location }) => {
            return listLocationGlobs(location);
          }),
          ...scopes.files.generated,
          ...scopes.files.fixtures,
        ],
      }),
    );
  }

  if (recommended) {
    configs.push(
      createRecommendedRules({
        root: context.root,
        scopes,
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
        codeFiles: resolveScope(scopes, ["files.code"]),
        tsconfig: await config.resolve("tsconfigPath"),
      }),
    );
  }

  const [structure, entities] = await Promise.all([
    config.resolve("structure"),
    config.resolve("entities"),
  ]);

  const roleRules = await createRoleRules(structure, entities);

  return defineConfig(
    {
      name: `${pluginName}/plugins`,
      plugins: {
        [pluginName]: createPlugin(conventionCategories, sections, context),
        ...(roleRules.configs.length === 0
          ? {}
          : { [rolesPluginName]: roleRules.plugin }),
        "@stylistic": stylistic,
        "package-json": packageJson,
        perfectionist,
        sonarjs,
        unicorn,
        "unused-imports": unusedImports,
      },
    },
    {
      files: resolveScope(scopes, ["files.code"]),
      extends: [typescriptConfigs.base],
    },
    ...configs,
    resolveInfoRules(conventionRules),
    ...roleRules.configs,
  );
}
