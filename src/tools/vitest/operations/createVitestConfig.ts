import { realpath } from "node:fs/promises";

import { configDefaults, coverageConfigDefaults } from "vitest/config";

import { flatMap } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

import { filesIn, resolve } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { optionsSchema } from "#tools/vitest/config/schemas/optionsSchema";
import {
  buildMode,
  defaultCoverageProvider,
  outDirGuard,
  pluginPrefix,
  sourceGuard,
} from "#tools/vitest/constants";
import { findSetupFiles } from "#tools/vitest/operations/findSetupFiles";
import { createOutDirGuard } from "#tools/vitest/plugins/createOutDirGuard";
import { createSourceGuard } from "#tools/vitest/plugins/createSourceGuard";
import type { LoadedConfig } from "#project/config/index";
import type { ConfigEnv, Plugin } from "#tools/vite/index";
import type { Config } from "#tools/vitest/types/Config";
import type { Options } from "#tools/vitest/types/Options";

async function createSourcePlugins(
  config: LoadedConfig,
  guardOutDir: boolean,
): Promise<Plugin[]> {
  const outDir = await config.resolve("build.outDir");

  const packageJson = await config.resolve("packageJson");

  const packageName = packageJson.optional.name;

  if (!guardOutDir || outDir === undefined || packageName === undefined) {
    return [];
  }

  return [
    createOutDirGuard(`${pluginPrefix}:${outDirGuard}`, {
      packageName,
      outDir: resolve(await realpath(config.context.root), outDir),
    }),
  ];
}

async function createDistPlugins(config: LoadedConfig): Promise<Plugin[]> {
  const traits = await config.resolve("traits");

  if (!traits.published) {
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

async function createTestsInclude(
  config: LoadedConfig,
  testsBuild: boolean,
): Promise<string[] | undefined> {
  const traits = await config.resolve("traits");

  if (!traits.published) {
    return;
  }

  // @debt `include` replaces Vitest's default, so `.js` and `.mjs` tests are no longer collected
  const tests = await config.resolve("tests");

  const { plain, source, dist } = tests.patterns;

  const patterns = [...plain, ...(testsBuild ? dist : source)];

  return [
    ...patterns,
    ...flatMap(await config.resolve("workspaces"), ({ dirs }) =>
      filesIn(dirs, patterns),
    ),
  ];
}

export async function createVitestConfig(
  config: LoadedConfig,
  { mode }: ConfigEnv,
  options?: Maybe<Options>,
): Promise<Config> {
  const roles = await config.resolve("environmentRoles");

  const {
    guardOutDir,
    isolate,
    restoreMocks = !isolate,
    setupFiles = await findSetupFiles({
      tests: await config.resolve("tests"),
      roles: roles.tests,
      filesystem: config.context.filesystem,
    }),
  } = validate(optionsSchema, options ?? {}, "Vitest options");

  const testsBuild = mode === buildMode;

  const tests = await config.resolve("tests");

  if (testsBuild && tests.active) {
    const { owner, file } = tests.dist.tsconfig;

    if (
      owner !== undefined &&
      file !== undefined &&
      (await tests.dist.tsconfig.path) === undefined
    ) {
      throw new Error(
        `The dist tsconfig ${file} does not exist in ${config.context.root}, run \`engrenage sync\` to create it`,
      );
    }
  }

  const tsconfig = await (testsBuild
    ? tests.dist.tsconfig.path
    : config.resolve("tsconfigPath"));

  const typecheckTsconfig = await (testsBuild
    ? tests.dist.tsconfig.path
    : tests.tsconfig.path);

  const include = await createTestsInclude(config, testsBuild);

  const { fixtures } = await config.resolve("files");

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
      ? await createDistPlugins(config)
      : await createSourcePlugins(config, guardOutDir),
    test: {
      ...(include === undefined ? {} : { include }),
      isolate,
      restoreMocks,
      setupFiles: [...setupFiles],
      exclude: [...configDefaults.exclude, ...fixtures],
      coverage: {
        provider: defaultCoverageProvider,
        exclude: [
          ...coverageConfigDefaults.exclude,
          ...tests.patterns.source,
          ...tests.patterns.dist,
        ],
        reportsDirectory: tests.coverageDir,
      },
      typecheck:
        typecheckTsconfig === undefined
          ? {}
          : {
              tsconfig: typecheckTsconfig,
            },
    },
  };
}
