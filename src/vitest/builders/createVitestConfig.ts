import { configDefaults, mergeConfig } from "vitest/config";
import type { Maybe } from "@auaust/toolkit/types";

import { validate } from "#support/validation/utils/validate";
import { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
import { createViteAliases } from "#vite/builders/createViteAliases";
import { createViteConfig } from "#vite/builders/createViteConfig";
import { createOutDirGuard } from "#vitest/builders/createOutDirGuard";
import { optionsSchema } from "#vitest/config/schemas/optionsSchema";
import { buildMode, defaultCoverageProvider } from "#vitest/constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Alias } from "#vite/types/Alias";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { Plugin } from "#vite/types/Plugin";
import type { Config } from "#vitest/types/Config";
import type { Options } from "#vitest/types/Options";

function createSourceAliases(config: ResolvedConfig): Alias[] {
  const { paths } = config.tsconfig.optional;

  if (paths === undefined) {
    return [];
  }

  const pathAliases = resolvePathAliases(
    config.packageJson.name,
    paths,
    config.root,
  );

  return createViteAliases(pathAliases, config.root);
}

function createSourcePlugins(
  config: ResolvedConfig,
  guardOutDir: boolean,
): Plugin[] {
  const { outDir } = config.tsconfig.optional;
  const packageName = config.packageJson.optional.name;

  if (!guardOutDir || outDir === undefined || packageName === undefined) {
    return [];
  }

  return [
    createOutDirGuard({
      packageName,
      outDir: config.resolve(outDir),
    }),
  ];
}

export function createVitestConfig(
  config: ResolvedConfig,
  { mode }: ConfigEnv,
  options?: Maybe<Options>,
): Config {
  const { guardOutDir } = validate(
    optionsSchema,
    options ?? {},
    "Vitest options",
  );

  const testsBuild = mode === buildMode;

  const tsconfig = testsBuild ? config.distTsconfigPath : config.tsconfigPath;

  return mergeConfig(createViteConfig(config), {
    tsconfig,
    resolve: {
      alias: testsBuild ? [] : createSourceAliases(config),
    },
    plugins: testsBuild ? [] : createSourcePlugins(config, guardOutDir),
    test: {
      exclude: [...configDefaults.exclude, config.files.fixtures],
      coverage: {
        provider: defaultCoverageProvider,
      },
      typecheck: {
        tsconfig,
      },
    },
  } satisfies Config);
}
