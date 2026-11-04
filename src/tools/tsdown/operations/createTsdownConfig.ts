import type { TsdownPlugin } from "tsdown";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { arethetypeswrongCore, packageJsonFile, publint } from "#constants";
import { readJsonFile } from "#foundation/filesystem/operations/readJsonFile";
import { validate } from "#foundation/options/utils/validate";
import { createDefine } from "#project/config/utils/createDefine";
import { optionsSchema } from "#tools/tsdown/config/schemas/optionsSchema";
import {
  attwOptions,
  emptyNamespaces,
  entrySelfReferences,
  mainFields,
  pluginNames,
  pluginPrefix,
} from "#tools/tsdown/constants";
import { resolveCommandEntries } from "#tools/tsdown/operations/resolveCommandEntries";
import { resolveSourceEntries } from "#tools/tsdown/operations/resolveSourceEntries";
import { createEmptyNamespacesPlugins } from "#tools/tsdown/plugins/createEmptyNamespacesPlugins";
import { createEntrySelfReferencesPlugins } from "#tools/tsdown/plugins/createEntrySelfReferencesPlugins";
import { createTsdownEntries } from "#tools/tsdown/utils/createTsdownEntries";
import { resolveDataExports } from "#tools/tsdown/utils/resolveDataExports";
import { resolveTsdownTarget } from "#tools/tsdown/utils/resolveTsdownTarget";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { PathAliases } from "#project/tsconfig/types/PathAliases";
import type { Config } from "#tools/tsdown/types/Config";
import type { Options } from "#tools/tsdown/types/Options";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

interface PluginContext {
  packageName: PackageName;
  sourceEntries: PathAliases;
  root: Directory;
}

const pluginFactories = {
  [emptyNamespaces]: (name) => createEmptyNamespacesPlugins(name),
  [entrySelfReferences]: (name, { packageName, sourceEntries, root }) => {
    return createEntrySelfReferencesPlugins(
      name,
      packageName,
      sourceEntries,
      root,
    );
  },
} satisfies Record<
  (typeof pluginNames)[number],
  (name: string, context: PluginContext) => TsdownPlugin[]
>;

function readPackageSnapshot(path: File): string {
  return JSON.stringify(readJsonFile(path));
}

function assertPackageUnchanged(path: File, snapshot: string) {
  if (readPackageSnapshot(path) !== snapshot) {
    throw new Error(
      `${path} changed during the build: build locally and commit the regenerated file`,
    );
  }
}

export function createTsdownConfig(
  config: ProjectConfig,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Config {
  const { bundle, plugins } = validate(
    optionsSchema,
    options ?? {},
    "tsdown options",
  );

  const { environment, packageJson, packageJsonPath } = config;
  const { path: tsconfigPath } = config.typescript.tsconfig;
  const { path: declarationsTsconfigPath } = config.src.tsconfig;

  // @debt repeats the "No package.json found" guard of createStepContext and syncChangesetConfig
  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.root}`);
  }

  if (packageJson.optional.type !== "module") {
    throw new Error(
      `${packageJsonPath} must declare "type": "module": libraries ship ESM only`,
    );
  }

  const { typed, sourcemap, emptyOutDir, outDir } = config.build;

  if (outDir === undefined) {
    throw new Error(
      `No output directory for ${config.root}: set build.outDir in the engrenage config or compilerOptions.outDir in the tsconfig`,
    );
  }

  const sourceEntries = resolveSourceEntries(config);

  const bins = resolveCommandEntries(config);

  const customExports = resolveDataExports(config, sourceEntries);

  const packageSnapshot = readPackageSnapshot(packageJsonPath);

  return {
    cwd: config.root,
    entry: createTsdownEntries(sourceEntries, bins),
    format: "esm",
    ...(config.src.runtime === undefined
      ? {}
      : {
          target: resolveTsdownTarget(config.src.runtime),
        }),
    outDir,
    clean: emptyOutDir,
    // @debt repeated === undefined checks instead of having a proper "prop if define" utility
    ...(tsconfigPath === undefined
      ? {}
      : {
          tsconfig: tsconfigPath,
        }),
    dts: {
      ...(declarationsTsconfigPath === undefined
        ? {}
        : {
            tsconfig: declarationsTsconfigPath,
          }),
      eager: typed,
      compilerOptions: {
        declaration: typed,
      },
      sourcemap,
    },
    exports: {
      enabled: true,
      packageJson: false,
      exclude: keys(bins),
      customExports,
    },
    sourcemap,
    plugins: flatMap(pluginNames, (name) => {
      return plugins[name] === false
        ? []
        : pluginFactories[name](`${pluginPrefix}:${name}`, {
            packageName: packageJson.name,
            sourceEntries,
            root: config.root,
          });
    }),
    define: createDefine(config, {
      isTesting: false,
    }),
    report: false,
    publint: environment.hasDependency(publint),
    attw: {
      enabled: environment.hasDependency(arethetypeswrongCore),
      ...attwOptions,
    },
    deps: {
      onlyBundle: [...bundle],
    },
    inputOptions: {
      resolve: {
        mainFields: [...mainFields],
      },
    },
    failOnWarn: ci,
    minify: ci,
    hooks: {
      "build:done"() {
        if (ci) {
          assertPackageUnchanged(packageJsonPath, packageSnapshot);
        }
      },
    },
  };
}
