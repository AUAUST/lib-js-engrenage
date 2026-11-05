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

export function createViteConfig(
  context: OptionContext<Sections>,
  { isTesting }: { isTesting: boolean },
): Config {
  const { get } = context;

  const { sourcemap, outDir, clean } = get("build");

  const { path: tsconfig } = get("typescript").tsconfig;

  return {
    root: get("root"),
    ...(tsconfig === undefined
      ? {}
      : {
          tsconfig,
        }),
    define: createDefine(context, {
      isTesting,
    }),
    ...(clean === "emitted" && outDir !== undefined
      ? {
          plugins: [
            createEmittedManifestPlugin(`${pluginPrefix}:emitted-manifest`, {
              manifest: join(get("cacheFor")(vite), emittedManifestFile),
              outDir: resolveWithin(get("root"), outDir),
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
