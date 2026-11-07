import { join } from "node:path";

import { project as pluginPrefix, vite } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { emittedManifestFile } from "#project/build/constants";
import { buildOutDirSection, buildSection } from "#project/build/index";
import { cacheSection } from "#project/cache/index";
import { createDefine } from "#project/environments/index";
import { tsconfigPathSection } from "#project/tsconfig/index";
import { createEmittedManifestPlugin } from "#tools/vite/plugins/createEmittedManifestPlugin";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";

export async function createViteConfig(
  config: LoadedConfig,
  { isTesting }: { isTesting: boolean },
): Promise<Config> {
  const root = config.context.root;

  const { sourcemap, clean } = await config.resolve(buildSection);

  const outDir = await config.resolve(buildOutDirSection);

  const tsconfig = await config.resolve(tsconfigPathSection);

  const cache = await config.resolve(cacheSection);

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
              manifest: join(cache.for(vite), emittedManifestFile),
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
