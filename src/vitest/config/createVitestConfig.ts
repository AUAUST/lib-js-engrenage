import { realpathSync } from "node:fs";

import { configDefaults } from "vitest/config";

import type { Maybe } from "@auaust/toolkit/types";

import { resolve } from "#support/filesystem/utils/resolve";
import { validate } from "#utils/validate";
import { optionsSchema } from "#vitest/config/schemas/optionsSchema";
import { buildMode, defaultCoverageProvider } from "#vitest/constants";
import { createOutDirGuard } from "#vitest/utils/createOutDirGuard";
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
    createOutDirGuard({
      packageName,
      outDir: resolve(realpathSync(config.root), outDir),
    }),
  ];
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
  } = validate(optionsSchema, options ?? {}, "Vitest options");

  const testsBuild = mode === buildMode;

  const tsconfig = testsBuild
    ? config.typescript.distTsconfig
    : config.typescript.tsconfig;

  return {
    tsconfig,
    resolve: {
      tsconfigPaths: !testsBuild,
    },
    plugins: testsBuild ? [] : createSourcePlugins(config, guardOutDir),
    test: {
      isolate,
      restoreMocks,
      exclude: [...configDefaults.exclude, ...config.test.fixtureFiles],
      coverage: {
        provider: defaultCoverageProvider,
        reportsDirectory: config.test.coverageDir,
      },
      typecheck: {
        tsconfig,
      },
    },
  };
}
