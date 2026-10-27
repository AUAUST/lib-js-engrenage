import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#vite/types/Config";

export function createViteConfig(config: ResolvedConfig): Config {
  return {
    root: config.root,
    tsconfig: config.tsconfigPath,
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      outDir: config.directories.output,
      emptyOutDir: config.build.emptyOutDir,
    },
  };
}
