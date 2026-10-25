import { rmSync } from "node:fs";

import { configDefaults, defineConfig } from "vitest/config";

import { loadConfig } from "#config/index";
import { resolvePathAliases } from "#typescript/index";
import { createViteAliases } from "#vite/index";

const config = await loadConfig(import.meta.dirname);

function getSourceAliases() {
  const pathAliases = resolvePathAliases(
    config.packageJson.name,
    config.tsconfig.paths,
    config.root,
  );

  return createViteAliases(pathAliases, config.root);
}

export default defineConfig(({ mode }) => {
  const shouldTestDist = mode === "build";

  if (!shouldTestDist) {
    rmSync(config.resolve(config.tsconfig.outDir), {
      recursive: true,
      force: true,
    });
  }

  return {
    resolve: {
      alias: shouldTestDist ? [] : getSourceAliases(),
    },
    test: {
      coverage: {
        provider: "istanbul",
      },
      exclude: [...configDefaults.exclude, "tests/fixtures/**"],
    },
    tsconfig: shouldTestDist ? "tsconfig.dist.json" : "tsconfig.json",
  };
});
