import { createDefine } from "#config/utils/createDefine";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#vite/types/Config";

export function createViteConfig(
  config: ResolvedConfig,
  { isTesting }: { isTesting: boolean },
): Config {
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
      outDir: config.build.outDir,
      emptyOutDir: config.build.emptyOutDir,
    },
  };
}
