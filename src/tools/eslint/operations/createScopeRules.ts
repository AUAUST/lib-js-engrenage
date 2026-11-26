import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { isArray } from "@auaust/toolkit";
import { flatMap, map } from "@auaust/toolkit/array";

import { rootScope } from "#batiment/scopes/constants";
import { filesIn, withExtensions } from "#foundation/filesystem/index";
import { readSelectedLanguage } from "#project/environments/index";
import {
  anyFile,
  pluginName,
  rolesPluginName,
  typescriptLanguage,
} from "#tools/eslint/constants";
import { createConventionRules } from "#tools/eslint/operations/createConventionRules";
import { createRecommendedRules } from "#tools/eslint/operations/createRecommendedRules";
import { resolveConventionSections } from "#tools/eslint/operations/resolveConventionSections";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { resolveScopeSources } from "#tools/eslint/operations/resolveScopeSources";
import { selectConventions } from "#tools/eslint/operations/selectConventions";
import { createImportPresets } from "#tools/eslint/utils/createImportPresets";
import { createPlugin } from "#tools/eslint/utils/createPlugin";
import { createRoleRules } from "#tools/eslint/utils/createRoleRules";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import type { ConfigContext, LoadedConfig } from "#project/config/index";
import type { Convention } from "#tools/eslint/ports/Convention";
import type { Config } from "#tools/eslint/types/Config";
import type { RoleRuleLoaders } from "#tools/eslint/types/RoleRuleLoaders";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

async function readTypescriptFiles(
  config: LoadedConfig,
): Promise<Glob | undefined> {
  const language = await readSelectedLanguage(config, typescriptLanguage);

  return language === undefined
    ? undefined
    : withExtensions("**/*", language.extensions);
}

function confine(
  configs: readonly Config[],
  dir: Directory,
  nested: Directories,
): Config[] {
  const excluded = filesIn(nested, anyFile);

  function confineFiles(files: Config["files"]): Pick<Config, "files"> {
    if (dir === rootScope) {
      return files === undefined ? {} : { files };
    }

    const within = filesIn(dir, anyFile);

    if (files === undefined) {
      return { files: [...within] };
    }

    return {
      files: files.map((entry) => {
        return [...within, ...(isArray(entry) ? entry : [entry])];
      }),
    };
  }

  return flatMap(configs, ({ files, ignores, ...config }) => {
    if (files?.length === 0) {
      return [];
    }

    const ignored = [...(ignores ?? []), ...excluded];

    return [
      {
        ...config,
        ...confineFiles(files),
        ...(ignored.length === 0 ? {} : { ignores: ignored }),
      },
    ];
  });
}

/**
 * Builds the ESLint config objects of one scope from its own config: its plugin
 * rules, recommended rules, import presets, selected conventions and role rules,
 * confined to its directory and leaving out the `nested` scopes' directories.
 * Rules resolve paths against `context`, the project root's.
 *
 * @throws {Error} A convention category or name in `settings` is unknown, or no
 * extension contributes a language an environment selects.
 */
export async function createScopeRules({
  config,
  nested,
  context,
  categories,
  settings,
  typeAware,
  recommended,
  roleRuleLoaders,
}: {
  config: LoadedConfig;
  nested: Directories;
  context: ConfigContext;
  categories: Readonly<Record<string, Readonly<Record<string, Convention>>>>;
  settings: Readonly<
    Record<string, boolean | Partial<Record<string, boolean>>>
  >;
  typeAware: boolean;
  recommended: boolean;
  roleRuleLoaders: RoleRuleLoaders;
}): Promise<Config[]> {
  const [
    scopes,
    traits,
    dependencies,
    structure,
    entities,
    resolveImport,
  ] = await Promise.all([
    resolveScopeSources(config),
    config.resolve("traits"),
    config.resolve("dependencies"),
    config.resolve("structure"),
    config.resolve("entities"),
    config.resolve("importResolver"),
  ]);

  const selected = selectConventions({
    categories,
    settings,
    typeAware,
    traits,
    dependencies,
  });

  const [sections, roleRules] = await Promise.all([
    resolveConventionSections(
      config,
      map(selected, ({ convention }) => convention),
    ),
    createRoleRules(
      {
        structure,
        entities,
        resolveImport,
      },
      roleRuleLoaders,
    ),
  ]);

  // @debt the project-only `files` key lists the root scope's published, private and discovered files alone, so references to them, type-aware recommended rules included, reach no workspace file
  const codeFiles = resolveScope(scopes, ["files.code"]);

  return confine(
    defineConfig(
      {
        name: `${pluginName}/plugins/${config.context.scopeDir}`,
        plugins: {
          [pluginName]: createPlugin(categories, sections, context),
          ...(roleRules.configs.length === 0
            ? {}
            : { [rolesPluginName]: roleRules.plugin }),
        },
      },
      {
        files: codeFiles,
        extends: [typescriptConfigs.base],
      },
      recommended
        ? createRecommendedRules({
            root: context.root,
            scopes,
            typeAware,
          })
        : [],
      settings.imports === false
        ? []
        : createImportPresets({
            codeFiles,
            typescriptFiles: await readTypescriptFiles(config),
            tsconfig: await config.resolve("tsconfigPath"),
          }),
      resolveInfoRules(
        createConventionRules({
          selected,
          sections,
          scopes,
          context,
        }),
      ),
      ...roleRules.configs,
    ),
    config.context.scopeDir,
    nested,
  );
}
