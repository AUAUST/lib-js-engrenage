import { join } from "node:path";

import type { TsdownPlugin } from "tsdown";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import {
  arethetypeswrongCore,
  packageJsonFile,
  publint,
  tsdown,
} from "#constants";
import { readJsonFile } from "#foundation/filesystem/operations/readJsonFile";
import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import { validate } from "#foundation/options/utils/validate";
import { emittedManifestFile } from "#project/build/constants";
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
import { createEmittedManifestPlugins } from "#tools/tsdown/plugins/createEmittedManifestPlugins";
import { createEmptyNamespacesPlugins } from "#tools/tsdown/plugins/createEmptyNamespacesPlugins";
import { createEntrySelfReferencesPlugins } from "#tools/tsdown/plugins/createEntrySelfReferencesPlugins";
import { createTsdownEntries } from "#tools/tsdown/utils/createTsdownEntries";
import { resolveDataExports } from "#tools/tsdown/utils/resolveDataExports";
import { resolveTsdownTarget } from "#tools/tsdown/utils/resolveTsdownTarget";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { ResolvedBuild } from "#project/build/types/ResolvedBuild";
import type { Environment } from "#project/config/types/Environment";
import type { ResolvedDefine } from "#project/config/types/ResolvedDefine";
import type { ResolvedBin } from "#project/environments/types/ResolvedBin";
import type { ResolvedData } from "#project/environments/types/ResolvedData";
import type { ResolvedSource } from "#project/environments/types/ResolvedSource";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { PathAliases } from "#project/tsconfig/types/PathAliases";
import type { ResolvedTypescript } from "#project/tsconfig/types/ResolvedTypescript";
import type { Tsconfig } from "#project/tsconfig/types/Tsconfig";
import type { Config } from "#tools/tsdown/types/Config";
import type { Options } from "#tools/tsdown/types/Options";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

interface Sections {
  root: Directory;
  cacheFor(packageName: PackageName): Directory;
  filesystem: Filesystem;
  environment: Environment;
  packageJson: PackageJson;
  packageJsonPath: File | undefined;
  tsconfig: Tsconfig;
  typescript: ResolvedTypescript;
  src: ResolvedSource;
  bin: ResolvedBin;
  data: ResolvedData;
  build: ResolvedBuild;
  define: ResolvedDefine;
}

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
  context: OptionContext<Sections>,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Config {
  const { bundle, plugins } = validate(
    optionsSchema,
    options ?? {},
    "tsdown options",
  );

  const { get } = context;

  const root = get("root");
  const packageJson = get("packageJson");
  const packageJsonPath = get("packageJsonPath");
  const source = get("src");
  const { path: tsconfigPath } = get("typescript").tsconfig;
  const { path: declarationsTsconfigPath } = source.tsconfig;

  // @debt repeats the "No package.json found" guard of createStepContext and syncChangesetConfig
  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${root}`);
  }

  if (packageJson.optional.type !== "module") {
    throw new Error(
      `${packageJsonPath} must declare "type": "module": libraries ship ESM only`,
    );
  }

  const { typed, sourcemap, clean, outDir } = get("build");

  if (outDir === undefined) {
    throw new Error(
      `No output directory for ${root}: set build.outDir in the engrenage config or compilerOptions.outDir in the tsconfig`,
    );
  }

  const sourceEntries = resolveSourceEntries({
    packageJson,
    root,
    src: source,
    tsconfig: get("tsconfig"),
  });

  const bins = resolveCommandEntries({
    bin: get("bin"),
    filesystem: get("filesystem"),
  });

  const customExports = resolveDataExports(
    { data: get("data") },
    sourceEntries,
  );

  const packageSnapshot = readPackageSnapshot(packageJsonPath);

  return {
    cwd: root,
    entry: createTsdownEntries(sourceEntries, bins),
    format: "esm",
    ...(source.runtime === undefined
      ? {}
      : {
          target: resolveTsdownTarget(source.runtime),
        }),
    outDir,
    clean: clean === "all",
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
    plugins: [
      ...flatMap(pluginNames, (name) => {
        return plugins[name] === false
          ? []
          : pluginFactories[name](`${pluginPrefix}:${name}`, {
              packageName: packageJson.name,
              sourceEntries,
              root,
            });
      }),
      ...(clean === "emitted"
        ? createEmittedManifestPlugins(`${pluginPrefix}:emitted-manifest`, {
            manifest: join(get("cacheFor")(tsdown), emittedManifestFile),
            outDir: resolveWithin(root, outDir),
          })
        : []),
    ],
    define: createDefine(context, {
      isTesting: false,
    }),
    report: false,
    publint: get("environment").hasDependency(publint),
    attw: {
      enabled: get("environment").hasDependency(arethetypeswrongCore),
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
