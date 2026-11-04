import { realpathSync } from "node:fs";

import { configDefaults, coverageConfigDefaults } from "vitest/config";

import type { Maybe } from "@auaust/toolkit/types";

import { resolve } from "#foundation/filesystem/utils/resolve";
import { validate } from "#foundation/options/utils/validate";
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
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { Plugin } from "#tools/vite/types/Plugin";
import type { Config } from "#tools/vitest/types/Config";
import type { Options } from "#tools/vitest/types/Options";

function createSourcePlugins(
  config: ProjectConfig,
  guardOutDir: boolean,
): Plugin[] {
  const { outDir } = config.build;
  const packageName = config.packageJson.optional.name;

  if (!guardOutDir || outDir === undefined || packageName === undefined) {
    return [];
  }

  return [
    createOutDirGuard(`${pluginPrefix}:${outDirGuard}`, {
      packageName,
      outDir: resolve(realpathSync(config.root), outDir),
    }),
  ];
}

function createDistPlugins(config: ProjectConfig): Plugin[] {
  if (!config.traits.published) {
    return [];
  }

  const root = realpathSync(config.root);

  return [
    createSourceGuard(`${pluginPrefix}:${sourceGuard}`, {
      sourceDirs: config.src.dirs.map((dir) => resolve(root, dir)),
    }),
  ];
}

function createTestsInclude(
  config: ProjectConfig,
  testsBuild: boolean,
): string[] | undefined {
  if (!config.traits.published) {
    return;
  }

  // @debt `include` replaces Vitest's default, so `.js` and `.mjs` tests are no longer collected
  const { plain, source, dist } = config.tests.patterns;

  return [...plain, ...(testsBuild ? dist : source)];
}

export function createVitestConfig(
  config: ProjectConfig,
  { mode }: ConfigEnv,
  options?: Maybe<Options>,
): Config {
  const {
    guardOutDir,
    isolate,
    restoreMocks = !isolate,
    setupFiles = findSetupFiles(config),
  } = validate(optionsSchema, options ?? {}, "Vitest options");

  const testsBuild = mode === buildMode;

  if (testsBuild && config.tests.active) {
    const { owner, file, path } = config.tests.dist.tsconfig;

    if (owner !== undefined && file !== undefined && path === undefined) {
      throw new Error(
        `The dist tsconfig ${file} does not exist in ${config.root}, run \`engrenage sync\` to create it`,
      );
    }
  }

  const tsconfig = testsBuild
    ? config.tests.dist.tsconfig.path
    : config.typescript.tsconfig.path;

  const typecheckTsconfig = testsBuild
    ? config.tests.dist.tsconfig.path
    : config.tests.tsconfig.path;

  const include = createTestsInclude(config, testsBuild);

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
      ? createDistPlugins(config)
      : createSourcePlugins(config, guardOutDir),
    test: {
      ...(include === undefined ? {} : { include }),
      isolate,
      restoreMocks,
      setupFiles: [...setupFiles],
      exclude: [...configDefaults.exclude, ...config.files.fixtures],
      coverage: {
        provider: defaultCoverageProvider,
        exclude: [
          ...coverageConfigDefaults.exclude,
          ...config.tests.patterns.source,
          ...config.tests.patterns.dist,
        ],
        reportsDirectory: config.tests.coverageDir,
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
