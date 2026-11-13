import { join } from "node:path";

import { project as pluginPrefix } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { emittedManifestFile } from "#project/build/constants";
import { createDefine } from "#project/environments/index";
import { createEmittedManifestPlugin } from "#tools/vite/plugins/createEmittedManifestPlugin";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";

/**
 * Builds the Vite config of a loaded config: root, tsconfig paths, defined
 * globals and build output, emptying the output directory only when `build.clean`
 * is `all`. `isTesting` drops build-only globals instead of test-only ones.
 */
export async function createViteConfig(
  config: LoadedConfig,
  { isTesting }: { isTesting: boolean },
): Promise<Config> {
  const root = config.context.root;

  const { sourcemap, clean } = await config.resolve("build");

  const outDir = await config.resolve("build.outDir");

  const tsconfig = await config.resolve("tsconfigPath");

  const resources = await config.resolve("resources");

  return {
    root,
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
    },
  };
}
