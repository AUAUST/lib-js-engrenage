import { rmSync } from "node:fs";
import { resolve } from "node:path";

import { configDefaults, defineConfig } from "vitest/config";

import { readCompilerOptions, resolvePathAliases } from "#typescript/index";
import { createViteAliases } from "#vite/index";
import packageJson from "./package.json" with { type: "json" };

const root = import.meta.dirname;

function getCompilerOptions() {
  const { outDir, paths } = readCompilerOptions(resolve(root, "tsconfig.json"));

  if (outDir == null || paths == null) {
    throw new Error("tsconfig.json must resolve outDir and paths");
  }

  return {
    outDir,
    paths,
  };
}

const { outDir, paths } = getCompilerOptions();

function getSourceAliases() {
  const pathAliases = resolvePathAliases(packageJson.name, paths, root);

  return createViteAliases(pathAliases, root);
}

export default defineConfig(({ mode }) => {
  const shouldTestDist = mode === "build";

  if (!shouldTestDist) {
    rmSync(outDir, {
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
