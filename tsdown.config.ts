import { packages } from "#constants";
import { defineTsdownConfig } from "#tsdown/index";

export default defineTsdownConfig({
  customExports: {
    "./agents/templates/*.md": "./data/agents/templates/*.md",
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
    "@clack/prompts",
    "@clack/core",
    "fast-string-truncated-width",
    "fast-string-width",
    "fast-wrap-ansi",
    "sisteransi",
  ],
});
