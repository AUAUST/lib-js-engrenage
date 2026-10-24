import { resolvePathAliases } from "./src/typescript/index";
import { createViteAliases } from "./src/vite/index";
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import packageJson from "./package.json" with { type: "json" };
import tsconfig from "./tsconfig.json" with { type: "json" };

const root = import.meta.dirname;

function getSourceAliases() {
  const pathAliases = resolvePathAliases(
    packageJson.name,
    tsconfig.compilerOptions.paths,
    root,
  );

  return createViteAliases(pathAliases, root);
}

export default defineConfig(({ mode }) => {
  const shouldTestDist = mode === "build";

  if (!shouldTestDist) {
    rmSync(resolve(root, tsconfig.compilerOptions.outDir), {
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
    },
    tsconfig: shouldTestDist ? "tsconfig.dist.json" : "tsconfig.json",
  };
});
