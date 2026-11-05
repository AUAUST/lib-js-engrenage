import { join } from "node:path";

import { project as pluginPrefix, vite } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { emittedManifestFile } from "#project/build/constants";
import { createDefine, type ResolvedDefine } from "#project/config/index";
import { createEmittedManifestPlugin } from "#tools/vite/plugins/createEmittedManifestPlugin";
import type { OptionContext } from "#foundation/options/index";
import type { ResolvedBuild } from "#project/build/index";
import type { ResolvedTypescript } from "#project/tsconfig/index";
import type { Config } from "#tools/vite/types/Config";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";

interface Sections {
  root: Directory;
  cacheFor(packageName: PackageName): Directory;
  build: ResolvedBuild;
  typescript: ResolvedTypescript;
  define: ResolvedDefine;
}

export async function createViteConfig(
  context: OptionContext<Sections>,
  { isTesting }: { isTesting: boolean },
): Promise<Config> {
  const { get } = context;

  const root = await get("root");
  const build = await get("build");
  const { sourcemap, clean } = build;
  const outDir = await build.outDir;

  const typescript = await get("typescript");

  const tsconfig = await typescript.tsconfig.path;

  return {
    root,
    ...(tsconfig === undefined
      ? {}
      : {
          tsconfig,
        }),
    define: await createDefine(context, {
      isTesting,
    }),
    ...(clean === "emitted" && outDir !== undefined
      ? {
          plugins: [
            createEmittedManifestPlugin(`${pluginPrefix}:emitted-manifest`, {
              manifest: join(
                (await get("cacheFor"))(vite),
                emittedManifestFile,
              ),
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
