import { join } from "node:path";

import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { project as pluginPrefix } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { emittedManifestFile } from "#project/build/constants";
import { createDefine } from "#project/environments/index";
import { createEmittedManifestPlugin } from "#tools/vite/plugins/createEmittedManifestPlugin";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";
import type { Directory } from "#types/Directory";

/**
 * Builds the Vite config of a loaded config: root, tsconfig paths, defined
 * globals, public directory and build output, emptying the output directory
 * only when `build.clean` is `all`. `isTesting` drops build-only globals
 * instead of test-only ones.
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

  const publicDir = await resolvePublicDir(config);

  return {
    root,
    publicDir,
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
            outDir,
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

  const [directory, ...others] = dirs;

  if (directory === undefined) {
    return false;
  }

  if (isNotEmpty(others)) {
    throw new Error(
      `Vite serves a single static directory, but \`static.dirs\` lists ${dirs.length}`,
    );
  }

  return resolveWithin(config.context.root, directory);
}
