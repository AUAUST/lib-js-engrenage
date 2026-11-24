import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

import { filter, map } from "@auaust/toolkit/array";
import { flatMap } from "@auaust/toolkit/iterable";
import { entries, getOwn, record, values } from "@auaust/toolkit/object";
import type { Maybe, MaybeArray } from "@auaust/toolkit/types";

import { rootScope } from "#batiment/scopes/constants";
import { validate } from "#foundation/options/index";
import { listLocationGlobs, type LoadedConfig } from "#project/config/index";
import { listScopeConfigs } from "#project/workspaces/index";
import { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";
import { pluginName } from "#tools/eslint/constants";
import { createPackageJsonRules } from "#tools/eslint/operations/createPackageJsonRules";
import { createScopeRules } from "#tools/eslint/operations/createScopeRules";
import { loadConventionCategories } from "#tools/eslint/operations/loadConventionCategories";
import { roleRuleLoaders } from "#tools/eslint/roles/index";
import { createIgnoreRules } from "#tools/eslint/utils/createIgnoreRules";
import type { Config } from "#tools/eslint/types/Config";
import type { Options } from "#tools/eslint/types/Options";

/**
 * Builds engrenage's ESLint config objects for a loaded config: ignores and
 * `package.json` rules, then each scope's recommended rules, import presets,
 * selected conventions and role rules from its own config, confined to its files;
 * each group is switched off by its option.
 *
 * @throws {Error} An option is invalid, a convention category or name is unknown,
 * or no extension contributes a language an environment selects.
 */
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
    roleRules: roleRuleOptions,
    ...categories
  } = validate(optionsSchema, options ?? {}, "ESLint options");

  // @debt convention categories load from the root config only, so a contribution active in one workspace alone reaches no scope until activation is scoped (#754)
  const [
    files,
    { scopes },
    scopeConfigs,
    conventionCategories,
  ] = await Promise.all([
    config.resolve("files"),
    config.resolve("scopes"),
    listScopeConfigs(config),
    loadConventionCategories(config),
  ]);

  const loaders = {
    ...roleRuleLoaders,
    ...record(
      entries(roleRuleOptions).map(([role, roleLoaders]) => {
        return [
          role,
          { ...getOwn(roleRuleLoaders, role), ...roleLoaders },
        ] as const;
      }),
    ),
  };

  const scopeRules = await Promise.all(
    scopeConfigs.map((scoped) => {
      const { scopeDir } = scoped.context;

      return createScopeRules({
        config: scopeDir === rootScope ? config : scoped,
        nested: map(
          filter(values(scopes), ({ parent }) => parent === scopeDir),
          ({ dir }) => dir,
        ),
        context,
        categories: conventionCategories,
        settings: categories,
        typeAware,
        recommended,
        roleRuleLoaders: loaders,
      });
    }),
  );

  const configs: MaybeArray<Config>[] = [];

  if (ignore) {
    const [
      resources,
      git,
    ] = await Promise.all([config.resolve("resources"), config.resolve("git")]);

    configs.push(
      createIgnoreRules({
        ignoreFiles: await git.ignoreFiles,
        excludeFiles: await git.excludeFiles,
        root: git.root,
        ignored: [
          ...flatMap(resources.list({ committed: false }), ({ location }) => {
            return listLocationGlobs(location);
          }),
          ...flatMap(resources.list({ linted: false }), ({ location }) => {
            return listLocationGlobs(location);
          }),
          ...files.generated,
          ...files.fixtures,
        ],
      }),
    );
  }

  if (packageJsonEnabled) {
    configs.push(createPackageJsonRules());
  }

  return defineConfig(
    {
      name: `${pluginName}/plugins`,
      plugins: {
        "package-json": packageJson,
        perfectionist,
        sonarjs,
        unicorn,
        "unused-imports": unusedImports,
      },
    },
    ...configs,
    ...scopeRules,
  );
}
