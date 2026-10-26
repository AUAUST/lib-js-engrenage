import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#vite/types/Config";

export function createViteConfig(config: ResolvedConfig): Config {
  const { outDir } = config.tsconfig.optional;

  return {
    root: config.root,
    tsconfig: config.tsconfigPath,
    build: {
      outDir,
    },
  };
}
