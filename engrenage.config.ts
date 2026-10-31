import { defineConfig } from "#config/index";

export default defineConfig({
  presets: ["library"],
  agents: {
    preferred: ["claude", "codex"],
  },
  tests: {
    dist: {
      tsconfig: { path: "tsconfig.dist.json" },
    },
  },
  src: {
    generated: ["eslint/types/Rules.ts", "eslint/types/rules/**"],
    discovered: ["eslint/conventions/*/*.ts"],
  },
  bin: {
    discovered: ["**/*.ts"],
  },
  scripts: {
    discovered: ["**/*.ts"],
  },
  data: {
    exports: {
      "./agents/templates/*.md": "data/agents/templates/*.md",
      "./agents/rules/*.md": "data/agents/rules/*.md",
      "./agents/sections/*.md": "data/agents/sections/*.md",
      "./github/workflows/*.yml": "data/github/workflows/*.yml",
      "./tsconfig/*.json": "data/tsconfig/*.json",
    },
  },
  tooling: {
    files: {
      append: ["src/prettier/index.ts"],
    },
  },
});
