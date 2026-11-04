import { createDefine } from "#project/config/utils/createDefine";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { ResolvedBuild } from "#project/build/types/ResolvedBuild";
import type { ResolvedDefine } from "#project/config/types/ResolvedDefine";
import type { ResolvedTypescript } from "#project/tsconfig/types/ResolvedTypescript";
import type { Config } from "#tools/vite/types/Config";
import type { Directory } from "#types/Directory";

interface Sections {
  root: Directory;
  build: ResolvedBuild;
  typescript: ResolvedTypescript;
  define: ResolvedDefine;
}

export function createViteConfig(
  context: OptionContext<Sections>,
  { isTesting }: { isTesting: boolean },
): Config {
  const { get } = context;

  const { sourcemap, outDir, emptyOutDir } = get("build");

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
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      ...(outDir === undefined
        ? {}
        : {
            outDir,
          }),
      emptyOutDir,
      sourcemap,
    },
  };
}
