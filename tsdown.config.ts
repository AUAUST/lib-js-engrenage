import { defineTsdownConfig } from "#tsdown/index";

export default defineTsdownConfig({
  bins: {
    "bin/engrenage": "bin/engrenage/index.ts",
  },
  fileExports: {
    "./agents/rules/*.md": "./data/agents/rules/*.md",
    "./agents/sections/*.md": "./data/agents/sections/*.md",
    "./tsconfig/*.json": "./data/tsconfig/*.json",
  },
  bundle: [
    "@auaust/toolkit",
    "@auaust/primitive-kit",
    "commander",
    "@commander-js/extra-typings",
  ],
});
