import { resolvePathAliases } from "./src/typescript/index";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "tsdown";
import initialPackageJson from "./package.json" with { type: "json" };
import tsconfig from "./tsconfig.json" with { type: "json" };

const root = import.meta.dirname;

const packageJsonUrl = new URL("./package.json", import.meta.url);

const typescriptPresets = {
  "./typescript/presets/*.json": "./src/typescript/presets/*.json",
};

function getEntries(): Record<string, string> {
  const entries: Record<string, string> = {};

  const pathAliases = resolvePathAliases(
    initialPackageJson.name,
    tsconfig.compilerOptions.paths,
    root,
  );

  for (const { name, path } of pathAliases) {
    entries[name] = path;
  }

  return entries;
}

async function assertPackageJsonUnchanged() {
  const content = await readFile(packageJsonUrl, "utf8");

  if (
    JSON.stringify(initialPackageJson) !== JSON.stringify(JSON.parse(content))
  ) {
    throw new Error("package.json is not up to date");
  }
}

export default defineConfig((_, { ci }) => {
  return {
    entry: getEntries(),
    outDir: resolve(root, tsconfig.compilerOptions.outDir),
    platform: "node",
    dts: true,
    exports: {
      enabled: true,
      packageJson: false,
      customExports(exports) {
        return {
          ...exports,
          ...typescriptPresets,
        };
      },
    },
    sourcemap: true,
    report: false,
    publint: true,
    attw: {
      enabled: true,
      profile: "node16",
      ignoreRules: ["cjs-resolves-to-esm"],
    },
    deps: {
      onlyBundle: ["@auaust/toolkit", "@auaust/primitive-kit"],
    },
    failOnWarn: ci,
    hooks: {
      "build:done"() {
        if (ci) {
          return assertPackageJsonUnchanged();
        }
      },
    },
    minify: ci,
  };
});
