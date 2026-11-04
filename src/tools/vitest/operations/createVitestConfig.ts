import { realpathSync } from "node:fs";

import { configDefaults, coverageConfigDefaults } from "vitest/config";

import { includes } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

import { resolve } from "#filesystem/utils/resolve";
import { validate } from "#options/utils/validate";
import { optionsSchema } from "#vitest/config/schemas/optionsSchema";
import {
  buildMode,
  defaultCoverageProvider,
  outDirGuard,
  pluginPrefix,
  sourceGuard,
} from "#vitest/constants";
import { findSetupFiles } from "#vitest/operations/findSetupFiles";
import { createOutDirGuard } from "#vitest/plugins/createOutDirGuard";
import { createSourceGuard } from "#vitest/plugins/createSourceGuard";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { Plugin } from "#vite/types/Plugin";
import type { Config } from "#vitest/types/Config";
import type { Options } from "#vitest/types/Options";

function createSourcePlugins(
  config: ResolvedConfig,
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

function createDistPlugins(config: ResolvedConfig): Plugin[] {
  // @debt the guard reads the `library` preset; it belongs to the `published` trait once that exists
  if (!includes(config.presets, "library")) {
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
  config: ResolvedConfig,
  testsBuild: boolean,
): string[] | undefined {
  // @debt the variants are selected by the `library` preset; they belong to the `published` trait once that exists
  if (!includes(config.presets, "library")) {
    return;
  }

  // @debt `include` replaces Vitest's default, so `.js` and `.mjs` tests are no longer collected
  const { plain, source, dist } = config.tests.patterns;

  return [...plain, ...(testsBuild ? dist : source)];
}

export function createVitestConfig(
  config: ResolvedConfig,
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
