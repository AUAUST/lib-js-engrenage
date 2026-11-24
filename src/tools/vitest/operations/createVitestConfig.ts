import { realpath } from "node:fs/promises";

import { configDefaults, coverageConfigDefaults } from "vitest/config";

import { flatMap, unique } from "@auaust/toolkit/iterable";
import type { Maybe } from "@auaust/toolkit/types";

import { noRoles } from "#batiment/roles/constants";
import { filesIn, resolve } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import {
  composeTestsPatterns,
  resolveEnvironmentTsconfig,
} from "#project/environments/index";
import { optionsSchema } from "#tools/vitest/config/schemas/optionsSchema";
import {
  buildMode,
  defaultCoverageProvider,
  outDirGuard,
  pluginPrefix,
  sourceGuard,
  vitestTestExtension,
} from "#tools/vitest/constants";
import { findSetupFiles } from "#tools/vitest/operations/findSetupFiles";
import { createOutDirGuard } from "#tools/vitest/plugins/createOutDirGuard";
import { createSourceGuard } from "#tools/vitest/plugins/createSourceGuard";
import type { LoadedConfig } from "#project/config/index";
import type { ConfigEnv, Plugin } from "#tools/vite/index";
import type { Config } from "#tools/vitest/types/Config";
import type { Options } from "#tools/vitest/types/Options";

type PluginSwitches = NonNullable<Options["plugins"]>;

async function createSourcePlugins(
  config: LoadedConfig,
  plugins: PluginSwitches,
): Promise<Plugin[]> {
  const outDir = await config.resolve("build.outDir");

  const packageJson = await config.resolve("packageJson");

  const packageName = packageJson.optional.name;

  if (
    plugins[outDirGuard] === false ||
    outDir === undefined ||
    packageName === undefined
  ) {
    return [];
  }

  return [
    createOutDirGuard(`${pluginPrefix}:${outDirGuard}`, {
      packageName,
      outDir: resolve(await realpath(config.context.root), outDir),
    }),
  ];
}

async function createDistPlugins(
  config: LoadedConfig,
  plugins: PluginSwitches,
): Promise<Plugin[]> {
  const traits = await config.resolve("traits");

  if (plugins[sourceGuard] === false || !traits.published) {
    return [];
  }

  const root = await realpath(config.context.root);

  const source = await config.resolve("src");

  return [
    createSourceGuard(`${pluginPrefix}:${sourceGuard}`, {
      sourceDirs: source.dirs.map((dir) => resolve(root, dir)),
    }),
  ];
}

async function createTestsPatterns(
  config: LoadedConfig,
  testsBuild: boolean,
): Promise<string[]> {
  const tests = await config.resolve("tests");

  const option = await config.resolve("tests.options");

  const vitestPatterns = composeTestsPatterns(option, vitestTestExtension);

  const patterns = [
    ...unique([
      ...tests.patterns.plain,
      ...(testsBuild ? tests.patterns.dist : tests.patterns.source),
      ...vitestPatterns.plain,
      ...(testsBuild ? vitestPatterns.dist : vitestPatterns.source),
    ]),
  ];

  return [
    ...patterns,
    ...flatMap(await config.resolve("workspaces"), ({ dirs }) => {
      return filesIn(dirs, patterns);
    }),
  ];
}

/**
 * Builds the Vitest config of a loaded config, testing sources, or the build
 * output in `build` mode, with guards against importing the other.
 *
 * @throws {Error} An option is invalid, or in `build` mode, the dist tsconfig
 * engrenage owns does not exist.
 */
export async function createVitestConfig(
  config: LoadedConfig,
  { mode }: ConfigEnv,
  options?: Maybe<Options>,
): Promise<Config> {
  const roles = await config.resolve("environmentRoles");

  const {
    plugins,
    isolate,
    restoreMocks = !isolate,
    setupFiles: addedSetupFiles = [],
  } = validate(optionsSchema, options ?? {}, "Vitest options");

  const discoveredSetupFiles = await findSetupFiles({
    tests: await config.resolve("tests"),
    roles: roles.tests ?? noRoles,
    filesystem: config.context.filesystem,
  });

  const setupFiles = [...unique([...discoveredSetupFiles, ...addedSetupFiles])];

  const testsBuild = mode === buildMode;

  const tests = await config.resolve("tests");

  if (testsBuild && tests.active) {
    const { file } = tests.dist.tsconfig;

    if (file !== undefined && (await tests.dist.tsconfig.path) === undefined) {
      throw new Error(
        `The dist tsconfig ${file} does not exist in ${config.context.root}, run \`engrenage sync\` to create it`,
      );
    }
  }

  const tsconfig = await (testsBuild
    ? tests.dist.tsconfig.path
    : config.resolve("tsconfigPath"));

  const checked = testsBuild
    ? tests.dist.tsconfig
    : await resolveEnvironmentTsconfig(config, "tests");

  const typecheckTsconfig = await checked.path;

  const testsPatterns = await createTestsPatterns(config, testsBuild);

  const { published } = await config.resolve("traits");

  const include = published ? testsPatterns : undefined;

  const [
    { fixtures },
    git,
  ] = await Promise.all([config.resolve("files"), config.resolve("git")]);

  const exclude = [
    ...configDefaults.exclude,
    ...(await git.ignored),
    ...fixtures,
  ];

  return {
    ...(tsconfig === undefined
      ? {}
      : {
          tsconfig,
        }),
    resolve: {
      tsconfigPaths: !testsBuild,
    },
    plugins: testsBuild
      ? await createDistPlugins(config, plugins)
      : await createSourcePlugins(config, plugins),
    test: {
      ...(include === undefined ? {} : { include }),
      isolate,
      restoreMocks,
      setupFiles,
      exclude,
      coverage: {
        provider: defaultCoverageProvider,
        exclude: [
          ...coverageConfigDefaults.exclude,
          ...tests.patterns.source,
          ...tests.patterns.dist,
        ],
        reportsDirectory: tests.coverageDir,
      },
      typecheck: {
        include: [
          ...unique([...configDefaults.typecheck.include, ...testsPatterns]),
        ],
        exclude,
        ...(typecheckTsconfig === undefined
          ? {}
          : { tsconfig: typecheckTsconfig }),
      },
    },
  };
}
