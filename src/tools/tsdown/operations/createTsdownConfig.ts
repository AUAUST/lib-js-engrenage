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
import { readJsonFile, resolveWithin } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { emittedManifestFile } from "#project/build/constants";
import {
  binSection,
  buildSection,
  cacheSection,
  createDefine,
  dataSection,
  environmentSection,
  packageJsonPathSection,
  packageJsonSection,
  sourceExportsSection,
  sourceSection,
  tsconfigSection,
  typescriptSection,
  workspacesSection,
  type LoadedConfig,
} from "#project/config/index";
import { optionsSchema } from "#tools/tsdown/config/schemas/optionsSchema";
import {
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
import type { PathAliases } from "#project/tsconfig/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";
import type { Config } from "#tools/tsdown/types/Config";
import type { Entries } from "#tools/tsdown/types/Entries";
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

function resolveWorkspaceEntries(
  groups: readonly ResolvedWorkspaceGroup[],
): Entries {
  const entries: Entries = {};

  for (const { dir, entry } of flatMap(
    groups,
    ({ workspaces }) => workspaces,
  )) {
    if (entry !== undefined) {
      entries[dir] = entry;
    }
  }

  return entries;
}

async function readPackageSnapshot(path: File): Promise<string> {
  return JSON.stringify(await readJsonFile(path));
}

async function assertPackageUnchanged(path: File, snapshot: string) {
  if ((await readPackageSnapshot(path)) !== snapshot) {
    throw new Error(
      `${path} changed during the build: build locally and commit the regenerated file`,
    );
  }
}

export async function createTsdownConfig(
  config: LoadedConfig,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Promise<Config> {
  const { bundle, plugins } = validate(
    optionsSchema,
    options ?? {},
    "tsdown options",
  );

  const root = config.context.root;
  const packageJson = await config.resolve(packageJsonSection);
  const packageJsonPath = await config.resolve(packageJsonPathSection);
  const source = await config.resolve(sourceSection);
  const typescript = await config.resolve(typescriptSection);

  const tsconfigPath = await typescript.tsconfig.path;
  const declarationsTsconfigPath = await source.tsconfig.path;

  // @debt repeats the "No package.json found" guard of createStepContext and syncChangesetConfig
  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${root}`);
  }

  if (packageJson.optional.type !== "module") {
    throw new Error(
      `${packageJsonPath} must declare "type": "module": libraries ship ESM only`,
    );
  }

  const build = await config.resolve(buildSection);
  const { typed, sourcemap, clean } = build;
  const outDir = await build.outDir;

  if (outDir === undefined) {
    throw new Error(
      `No output directory for ${root}: set build.outDir in the engrenage config or compilerOptions.outDir in the tsconfig`,
    );
  }

  const sourceEntries = await resolveSourceEntries({
    packageJson,
    root,
    exposed: await config.resolve(sourceExportsSection),
    tsconfig: await config.resolve(tsconfigSection),
  });

  const bins = await resolveCommandEntries({
    bin: await config.resolve(binSection),
    filesystem: config.context.filesystem,
  });

  const workspaceEntries = resolveWorkspaceEntries(
    await config.resolve(workspacesSection),
  );

  const customExports = resolveDataExports(
    { data: await config.resolve(dataSection) },
    sourceEntries,
  );

  const packageSnapshot = await readPackageSnapshot(packageJsonPath);

  const environment = await config.resolve(environmentSection);

  const cache = await config.resolve(cacheSection);

  return {
    cwd: root,
    entry: createTsdownEntries(sourceEntries, bins, workspaceEntries),
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
      exclude: [...keys(bins), ...keys(workspaceEntries)],
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
            manifest: join(cache.for(tsdown), emittedManifestFile),
            outDir: resolveWithin(root, outDir),
          })
        : []),
    ],
    define: await createDefine(config, {
      isTesting: false,
    }),
    report: false,
    publint: environment.hasDependency(publint),
    attw: {
      enabled: environment.hasDependency(arethetypeswrongCore),
      profile: "node16",
      ignoreRules: ["cjs-resolves-to-esm"],
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
      async "build:done"() {
        if (ci) {
          await assertPackageUnchanged(packageJsonPath, packageSnapshot);
        }
      },
    },
  };
}
