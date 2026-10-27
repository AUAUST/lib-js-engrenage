import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#vite/types/Config";

export function createViteConfig(config: ResolvedConfig): Config {
  return {
    root: config.root,
    tsconfig: config.typescript.tsconfig,
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      outDir: config.build.outDir,
      emptyOutDir: config.build.emptyOutDir,
    },
  };
}
