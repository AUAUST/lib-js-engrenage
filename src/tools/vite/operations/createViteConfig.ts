import { join } from "node:path";

import { isNonEmptyArray } from "@auaust/toolkit/array";

import { project as pluginPrefix } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { resolveBuildTarget } from "#project/baseline/index";
import { emittedManifestFile } from "#project/build/constants";
import {
  createDefine,
  resolveEntriesRuntime,
  type ResolvedSource,
} from "#project/environments/index";
import { createEmittedManifestPlugin } from "#tools/vite/plugins/createEmittedManifestPlugin";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

function resolveOnlyDirectory(
  root: Directory,
  dirs: Directories,
  failure: string,
): Directory | undefined {
  const [directory, ...others] = dirs;

  if (directory === undefined) {
    return;
  }

  if (isNonEmptyArray(others)) {
    throw new Error(failure);
  }

  return resolveWithin(root, directory);
}

function resolveViteRoot(
  root: Directory,
  source: ResolvedSource,
  isTesting: boolean,
): Pick<Config, "root"> {
  if (isTesting || !source.active) {
    return { root };
  }

  const [directory, ...others] = source.dirs;

  if (isNonEmptyArray(others)) {
    return {};
  }

  return {
    root: directory === undefined ? root : resolveWithin(root, directory),
  };
}

/**
 * Builds the Vite config of a loaded config: root, tsconfig paths, defined
 * globals, public directory and build output, emptying the output directory only
 * when `build.clean` is `all`. The root is the src environment's only directory,
 * or the project root under tests or without an active src directory; it stays
 * unset when the src environment has several directories, for a native config
 * to set. The output and env directories are absolute from the project root, so
 * a native config setting `root` never moves them. `isTesting` drops build-only
 * globals instead of test-only ones.
 *
 * @throws {Error} The static environment has several directories.
 */
export async function createViteConfig(
  config: LoadedConfig,
  { isTesting }: { isTesting: boolean },
): Promise<Config> {
  const root = config.context.root;

  const { sourcemap, clean, minify } = await config.resolve("build");

  const outDir = await config.resolve("build.outDir");

  const tsconfig = await config.resolve("tsconfigPath");

  const resources = await config.resolve("resources");

  const source = await config.resolve("src");

  const runtime = await resolveEntriesRuntime(config);

  return {
    ...resolveViteRoot(root, source, isTesting),
    envDir: root,
    publicDir: await resolvePublicDir(config),
    ...(tsconfig === undefined
      ? {}
      : {
          tsconfig,
        }),
    define: await createDefine(config, {
      isTesting,
    }),
    ...(clean === "emitted" && outDir !== undefined
      ? {
          plugins: [
            createEmittedManifestPlugin(`${pluginPrefix}:emitted-manifest`, {
              manifest: join(resources.path("cache.vite"), emittedManifestFile),
              outDir: resolveWithin(root, outDir),
            }),
          ],
        }
      : {}),
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      ...(outDir === undefined
        ? {}
        : {
            outDir: resolveWithin(root, outDir),
          }),
      ...(runtime === undefined
        ? {}
        : {
            target: resolveBuildTarget(runtime),
          }),
      emptyOutDir: clean === "all",
      sourcemap,
      minify: minify !== false,
      rolldownOptions: {
        output: {
          keepNames: minify === "keepNames",
        },
      },
    },
  };
}

async function resolvePublicDir(
  config: LoadedConfig,
): Promise<Directory | false> {
  const { dirs } = await config.resolve("static");

  return (
    resolveOnlyDirectory(
      config.context.root,
      dirs,
      `Vite serves a single static directory, but \`static.dirs\` lists ${dirs.length}`,
    ) ?? false
  );
}
