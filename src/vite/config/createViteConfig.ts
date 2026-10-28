import { createDefine } from "#config/utils/createDefine";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#vite/types/Config";

export function createViteConfig(
  config: ResolvedConfig,
  { isTesting }: { isTesting: boolean },
): Config {
  const { sourcemap, outDir, emptyOutDir } = config.build;

  return {
    root: config.root,
    tsconfig: config.typescript.tsconfig,
    define: createDefine(config, {
      isTesting,
    }),
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      outDir,
      emptyOutDir,
      sourcemap,
    },
  };
}
