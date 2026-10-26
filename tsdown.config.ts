import { packages } from "#constants";
import { defineTsdownConfig } from "#tsdown/index";

export default defineTsdownConfig({
  bins: {
    "bin/engrenage": "bin/engrenage/index.ts",
  },
  customExports: {
    "./agents/rules/*.md": "./data/agents/rules/*.md",
    "./agents/sections/*.md": "./data/agents/sections/*.md",
    "./github/workflows/*.yml": "./data/github/workflows/*.yml",
    "./tsconfig/*.json": "./data/tsconfig/*.json",
  },
  bundle: [
    packages.toolkit,
    packages.primitiveKit,
    "commander",
    "@commander-js/extra-typings",
    "jsonc-parser",
  ],
});
