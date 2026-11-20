import { join } from "node:path";

import type { TsdownPlugin } from "tsdown";

import { isNonEmptyArray } from "@auaust/toolkit/array";
import { flatMap } from "@auaust/toolkit/iterable";
import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { arethetypeswrongCore, packageJsonFile, publint } from "#constants";
import { readJsonFile, resolveWithin } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { resolveBuildTarget } from "#project/baseline/index";
import { emittedManifestFile } from "#project/build/constants";
import { createDefine } from "#project/environments/index";
import { sourceCondition } from "#project/package/constants";
import { noRoles } from "#project/structure/constants";
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
import { createInternalTagsPlugins } from "#tools/tsdown/plugins/createInternalTagsPlugins";
import { createOmittedDeclarationsPlugins } from "#tools/tsdown/plugins/createOmittedDeclarationsPlugins";
import { createTsdownEntries } from "#tools/tsdown/utils/createTsdownEntries";
import { resolveDataExports } from "#tools/tsdown/utils/resolveDataExports";
import type { LoadedConfig } from "#project/config/index";
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
} satisfies Record<(typeof pluginNames)[number], (name: string, context: PluginContext) => TsdownPlugin[]>;

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

// @debt rolldown's `output.keepNames` would also keep the names bundling renames, but rolldown-plugin-dts leaves its `__name` helper imported from the JS runtime chunk in declaration chunks, so the minifier keeps names instead; switch back once the plugin strips that helper
function resolveMinify(minify: boolean | "keepNames") {
  if (minify !== "keepNames") {
    return minify;
  }

  return {
    compress: {
      keepNames: { function: true, class: true },
    },
    mangle: {
      keepNames: { function: true, class: true },
    },
  };
}

/**
 * Builds the tsdown config of a loaded config: ESM entries from the package
 * exports, commands and workspaces, declarations, plugins and packaging checks
 * of the installed tools. The build fails when it changes `package.json`.
 *
 * @throws {Error} No `package.json` exists or it does not declare
 * `"type": "module"`, no output directory is set, an option is invalid,
 * or entries conflict.
 */
export async function createTsdownConfig(
  config: LoadedConfig,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Promise<Config> {
  const {
    bundle,
    plugins,
  } = validate(optionsSchema, options ?? {}, "tsdown options");

  const root = config.context.root;

  const packageJson = await config.resolve("packageJson");

  const packageJsonPath = await config.resolve("packageJsonPath");

  const source = await config.resolve("src");

  const tsconfigPath = await config.resolve("tsconfigPath");

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

  const {
    typed,
    sourcemap,
    clean,
    minify,
    sourceExports,
  } = await config.resolve("build");

  const outDir = await config.resolve("build.outDir");

  if (outDir === undefined) {
    throw new Error(
      `No output directory for ${root}: set build.outDir in the engrenage config or compilerOptions.outDir in the tsconfig, or select a build tool providing one`,
    );
  }

  const sourceEntries = await resolveSourceEntries({
    packageJson,
    root,
    exposed: await config.resolve("src.exports"),
    tsconfig: await config.resolve("tsconfig"),
  });

  const roles = await config.resolve("environmentRoles");

  const bins = await resolveCommandEntries({
    bin: await config.resolve("bin"),
    roles: roles.bin ?? noRoles,
    filesystem: config.context.filesystem,
  });

  const workspaceEntries = resolveWorkspaceEntries(
    await config.resolve("workspaces"),
  );

  const customExports = resolveDataExports(
    { data: await config.resolve("data") },
    sourceEntries,
  );

  const packageSnapshot = await readPackageSnapshot(packageJsonPath);

  const dependencies = await config.resolve("dependencies");

  const resources = await config.resolve("resources");

  const { tags } = await config.resolve("docs");

  const internalTags = tags
    .filter(({ output }) => output === "internal")
    .map(({ name }) => name);

  return {
    cwd: root,
    entry: createTsdownEntries(sourceEntries, bins, workspaceEntries),
    format: "esm",
    ...(source.runtime === undefined
      ? {}
      : {
          target: resolveBuildTarget(source.runtime),
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
      tsc: {
        eager: typed,
      },
      compilerOptions: {
        declaration: typed,
      },
      sourcemap,
    },
    exports: {
      enabled: true,
      bin: false,
      ...(sourceExports
        ? {
            devExports: sourceCondition,
          }
        : {}),
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
      ...createOmittedDeclarationsPlugins(
        `${pluginPrefix}:bin-declarations`,
        keys(bins),
      ),
      ...(isNonEmptyArray(internalTags)
        ? createInternalTagsPlugins(
            `${pluginPrefix}:internal-tags`,
            internalTags,
          )
        : []),
      ...(clean === "emitted"
        ? createEmittedManifestPlugins(`${pluginPrefix}:emitted-manifest`, {
            manifest: join(resources.path("cache.tsdown"), emittedManifestFile),
            outDir: resolveWithin(root, outDir),
          })
        : []),
    ],
    define: await createDefine(config, {
      isTesting: false,
    }),
    report: false,
    publint: dependencies.hasDependency(publint),
    attw: {
      enabled: dependencies.hasDependency(arethetypeswrongCore),
      profile: "node16",
      ignoreRules: ["cjs-resolves-to-esm"],
    },
    deps: {
      // @debt bundling a new dependency means hand-adding it and its dependency closure to the generated `inlinedDependencies` field; bundling a package should bring its own dependency closure
      onlyBundle: [
        ...(bundle ?? packageJson.optional.inlinedDependencies ?? []),
      ],
    },
    inputOptions: {
      resolve: {
        mainFields: [...mainFields],
      },
    },
    ...(typed
      ? {
          outputOptions: {
            comments: {
              jsdoc: false,
              legal: true,
              annotation: true,
            },
          },
        }
      : {}),
    failOnWarn: true,
    minify: resolveMinify(minify),
    hooks: {
      async "build:done"() {
        if (ci) {
          await assertPackageUnchanged(packageJsonPath, packageSnapshot);
        }
      },
    },
  };
}
