import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import type { Maybe, MaybeArray } from "@auaust/toolkit/types";

import { withExtensions } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { listLocationGlobs, type LoadedConfig } from "#project/config/index";
import { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";
import {
  pluginName,
  rolesPluginName,
  typescriptLanguage,
} from "#tools/eslint/constants";
import { createConventionRules } from "#tools/eslint/operations/createConventionRules";
import { createPackageJsonRules } from "#tools/eslint/operations/createPackageJsonRules";
import { createRecommendedRules } from "#tools/eslint/operations/createRecommendedRules";
import { loadConventionCategories } from "#tools/eslint/operations/loadConventionCategories";
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
import type { Glob } from "#types/Glob";

async function readTypescriptFiles(config: LoadedConfig): Promise<Glob> {
  const languages = await config.context.registry.contributions(
    "languages",
    config,
  );

  const typescript = languages.find(({ entry }) => {
    return entry.name === typescriptLanguage;
  });

  if (typescript === undefined) {
    throw new Error(
      `ESLint targets the ${typescriptLanguage} language, which no active extension contributes`,
    );
  }

  return withExtensions("**/*", typescript.entry.extensions);
}

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

  const [scopes, traits, environment, conventionCategories] = await Promise.all(
    [
      resolveScopeSources(config),
      config.resolve("traits"),
      config.resolve("environment"),
      loadConventionCategories(config),
    ],
  );

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
    const [
      resources,
      git,
    ] = await Promise.all([config.resolve("resources"), config.resolve("git")]);

    configs.push(
      createIgnoreRules({
        ignoreFiles: await git.ignoreFiles,
        ignored: [
          ...flatMap(resources.list({ committed: false }), ({ location }) => {
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
        typescriptFiles: await readTypescriptFiles(config),
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
