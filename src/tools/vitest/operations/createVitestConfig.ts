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
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { ResolvedBuild } from "#project/build/types/ResolvedBuild";
import type { ResolvedFiles } from "#project/config/types/ResolvedFiles";
import type { ResolvedSource } from "#project/environments/types/ResolvedSource";
import type { ResolvedTests } from "#project/environments/types/ResolvedTests";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { ResolvedTraits } from "#project/presets/types/ResolvedTraits";
import type { ResolvedTypescript } from "#project/tsconfig/types/ResolvedTypescript";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { Plugin } from "#tools/vite/types/Plugin";
import type { Config } from "#tools/vitest/types/Config";
import type { Options } from "#tools/vitest/types/Options";
import type { Directory } from "#types/Directory";

interface Sections {
  root: Directory;
  filesystem: Filesystem;
  packageJson: PackageJson;
  traits: ResolvedTraits;
  build: ResolvedBuild;
  src: ResolvedSource;
  tests: ResolvedTests;
  typescript: ResolvedTypescript;
  files: ResolvedFiles;
}

function createSourcePlugins(
  { get }: OptionContext<Sections>,
  guardOutDir: boolean,
): Plugin[] {
  const { outDir } = get("build");
  const packageName = get("packageJson").optional.name;

  if (!guardOutDir || outDir === undefined || packageName === undefined) {
    return [];
  }

  return [
    createOutDirGuard(`${pluginPrefix}:${outDirGuard}`, {
      packageName,
      outDir: resolve(realpathSync(get("root")), outDir),
    }),
  ];
}

function createDistPlugins({ get }: OptionContext<Sections>): Plugin[] {
  if (!get("traits").published) {
    return [];
  }

  const root = realpathSync(get("root"));

  return [
    createSourceGuard(`${pluginPrefix}:${sourceGuard}`, {
      sourceDirs: get("src").dirs.map((dir) => resolve(root, dir)),
    }),
  ];
}

function createTestsInclude(
  { get }: OptionContext<Sections>,
  testsBuild: boolean,
): string[] | undefined {
  if (!get("traits").published) {
    return;
  }

  // @debt `include` replaces Vitest's default, so `.js` and `.mjs` tests are no longer collected
  const { plain, source, dist } = get("tests").patterns;

  return [...plain, ...(testsBuild ? dist : source)];
}

export function createVitestConfig(
  context: OptionContext<Sections>,
  { mode }: ConfigEnv,
  options?: Maybe<Options>,
): Config {
  const { get } = context;

  const {
    guardOutDir,
    isolate,
    restoreMocks = !isolate,
    setupFiles = findSetupFiles({
      tests: get("tests"),
      filesystem: get("filesystem"),
    }),
  } = validate(optionsSchema, options ?? {}, "Vitest options");

  const testsBuild = mode === buildMode;

  if (testsBuild && get("tests").active) {
    const { owner, file, path } = get("tests").dist.tsconfig;

    if (owner !== undefined && file !== undefined && path === undefined) {
      throw new Error(
        `The dist tsconfig ${file} does not exist in ${get("root")}, run \`engrenage sync\` to create it`,
      );
    }
  }

  const tsconfig = testsBuild
    ? get("tests").dist.tsconfig.path
    : get("typescript").tsconfig.path;

  const typecheckTsconfig = testsBuild
    ? get("tests").dist.tsconfig.path
    : get("tests").tsconfig.path;

  const include = createTestsInclude(context, testsBuild);

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
      ? createDistPlugins(context)
      : createSourcePlugins(context, guardOutDir),
    test: {
      ...(include === undefined ? {} : { include }),
      isolate,
      restoreMocks,
      setupFiles: [...setupFiles],
      exclude: [...configDefaults.exclude, ...get("files").fixtures],
      coverage: {
        provider: defaultCoverageProvider,
        exclude: [
          ...coverageConfigDefaults.exclude,
          ...get("tests").patterns.source,
          ...get("tests").patterns.dist,
        ],
        reportsDirectory: get("tests").coverageDir,
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
