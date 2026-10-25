import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "tsdown";
import initialPackageJson from "./package.json" with { type: "json" };
import { readCompilerOptions, resolvePathAliases } from "#typescript/index";

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

const packageJsonUrl = new URL("./package.json", import.meta.url);

const binEntries = {
  "bin/engrenage": "bin/engrenage/index.ts",
};

const fileExports = {
  "./agents/rules/*.md": "./data/agents/rules/*.md",
  "./agents/sections/*.md": "./data/agents/sections/*.md",
  "./tsconfig/*.json": "./data/tsconfig/*.json",
};

function getEntries(): Record<string, string> {
  const entries: Record<string, string> = {};

  const pathAliases = resolvePathAliases(initialPackageJson.name, paths, root);

  for (const { name, path } of pathAliases) {
    entries[name] = path;
  }

  return {
    ...entries,
    ...binEntries,
  };
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
    outDir,
    platform: "node",
    dts: {
      compilerOptions: {
        declaration: true,
      },
      sourcemap: true,
    },
    exports: {
      enabled: true,
      packageJson: false,
      exclude: [/^bin\//],
      customExports(exports) {
        return {
          ...exports,
          ...fileExports,
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
      onlyBundle: [
        "@auaust/toolkit",
        "@auaust/primitive-kit",
        "commander",
        "@commander-js/extra-typings",
      ],
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
