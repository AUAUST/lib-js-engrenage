import type { TsdownPlugin } from "tsdown";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { createDefine } from "#config/utils/createDefine";
import { arethetypeswrongCore, packageJsonFile, publint } from "#constants";
import { validate } from "#foundation/options/utils/validate";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { optionsSchema } from "#tsdown/config/schemas/optionsSchema";
import {
  attwOptions,
  emptyNamespaces,
  entrySelfReferences,
  mainFields,
  pluginNames,
  pluginPrefix,
} from "#tsdown/constants";
import { createEmptyNamespacesPlugins } from "#tsdown/plugins/createEmptyNamespacesPlugins";
import { createEntrySelfReferencesPlugins } from "#tsdown/plugins/createEntrySelfReferencesPlugins";
import { createTsdownEntries } from "#tsdown/utils/createTsdownEntries";
import { resolveCommandEntries } from "#tsdown/utils/resolveCommandEntries";
import { resolveDataExports } from "#tsdown/utils/resolveDataExports";
import { resolveSourceEntries } from "#tsdown/utils/resolveSourceEntries";
import { resolveTsdownTarget } from "#tsdown/utils/resolveTsdownTarget";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#tsdown/types/Config";
import type { Options } from "#tsdown/types/Options";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";
import type { PathAliases } from "#typescript/types/PathAliases";

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
  config: ResolvedConfig,
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
