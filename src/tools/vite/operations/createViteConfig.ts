import { join } from "node:path";

import { project as pluginPrefix, vite } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { emittedManifestFile } from "#project/build/constants";
import {
  buildSection,
  cacheSection,
  createDefine,
  typescriptSection,
  type LoadedConfig,
} from "#project/config/index";
import { createEmittedManifestPlugin } from "#tools/vite/plugins/createEmittedManifestPlugin";
import type { Config } from "#tools/vite/types/Config";

export async function createViteConfig(
  config: LoadedConfig,
  { isTesting }: { isTesting: boolean },
): Promise<Config> {
  const root = config.context.root;
  const build = await config.resolve(buildSection);
  const { sourcemap, clean } = build;
  const outDir = await build.outDir;

  const typescript = await config.resolve(typescriptSection);

  const tsconfig = await typescript.tsconfig.path;

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
