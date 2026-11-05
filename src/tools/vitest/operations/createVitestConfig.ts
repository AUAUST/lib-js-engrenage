import { realpathSync } from "node:fs";

import { configDefaults, coverageConfigDefaults } from "vitest/config";

import { flatMap } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

import {
  filesIn,
  resolve,
  type Filesystem,
} from "#foundation/filesystem/index";
import { validate, type OptionContext } from "#foundation/options/index";
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
import type { ResolvedBuild } from "#project/build/index";
import type { ResolvedFiles } from "#project/config/index";
import type {
  ResolvedSource,
  ResolvedTests,
} from "#project/environments/index";
import type { PackageJson } from "#project/package/index";
import type { ResolvedTraits } from "#project/presets/index";
import type { ResolvedTypescript } from "#project/tsconfig/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";
import type { ConfigEnv, Plugin } from "#tools/vite/index";
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
  workspaces: readonly ResolvedWorkspaceGroup[];
}

async function createSourcePlugins(
  { get }: OptionContext<Sections>,
  guardOutDir: boolean,
): Promise<Plugin[]> {
  const build = await get("build");

  const outDir = await build.outDir;
  const packageJson = await get("packageJson");

  const packageName = packageJson.optional.name;

  if (!guardOutDir || outDir === undefined || packageName === undefined) {
    return [];
  }

  return [
    createOutDirGuard(`${pluginPrefix}:${outDirGuard}`, {
      packageName,
      outDir: resolve(realpathSync(await get("root")), outDir),
    }),
  ];
}

async function createDistPlugins({
  get,
}: OptionContext<Sections>): Promise<Plugin[]> {
  const traits = await get("traits");

  if (!traits.published) {
    return [];
  }

  const root = realpathSync(await get("root"));

  const source = await get("src");

  return [
    createSourceGuard(`${pluginPrefix}:${sourceGuard}`, {
      sourceDirs: source.dirs.map((dir) => resolve(root, dir)),
    }),
  ];
}

async function createTestsInclude(
  { get }: OptionContext<Sections>,
  testsBuild: boolean,
): Promise<string[] | undefined> {
  const traits = await get("traits");

  if (!traits.published) {
    return;
  }

  // @debt `include` replaces Vitest's default, so `.js` and `.mjs` tests are no longer collected
  const tests = await get("tests");

  const { plain, source, dist } = tests.patterns;

  const patterns = [...plain, ...(testsBuild ? dist : source)];

  return [
    ...patterns,
    ...flatMap(await get("workspaces"), ({ dirs }) => filesIn(dirs, patterns)),
  ];
}

export async function createVitestConfig(
  context: OptionContext<Sections>,
  { mode }: ConfigEnv,
  options?: Maybe<Options>,
): Promise<Config> {
  const { get } = context;

  const {
    guardOutDir,
    isolate,
    restoreMocks = !isolate,
    setupFiles = findSetupFiles({
      tests: await get("tests"),
      filesystem: await get("filesystem"),
    }),
  } = validate(optionsSchema, options ?? {}, "Vitest options");

  const testsBuild = mode === buildMode;
  const tests = await get("tests");

  if (testsBuild && tests.active) {
    const { owner, file, path } = tests.dist.tsconfig;

    if (owner !== undefined && file !== undefined && path === undefined) {
      throw new Error(
        `The dist tsconfig ${file} does not exist in ${await get("root")}, run \`engrenage sync\` to create it`,
      );
    }
  }

  const typescript = await get("typescript");

  const tsconfig = testsBuild
    ? tests.dist.tsconfig.path
    : await typescript.tsconfig.path;

  const typecheckTsconfig = testsBuild
    ? tests.dist.tsconfig.path
    : tests.tsconfig.path;

  const include = await createTestsInclude(context, testsBuild);
  const { fixtures } = await get("files");

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
      ? await createDistPlugins(context)
      : await createSourcePlugins(context, guardOutDir),
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
