import { createDefine } from "#project/config/utils/createDefine";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Config } from "#tools/vite/types/Config";

export function createViteConfig(
  config: ProjectConfig,
  { isTesting }: { isTesting: boolean },
): Config {
  const { sourcemap, outDir, emptyOutDir } = config.build;

  const { path: tsconfig } = config.typescript.tsconfig;

  return {
    root: config.root,
    ...(tsconfig === undefined
      ? {}
      : {
          tsconfig,
        }),
    define: createDefine(config, {
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
