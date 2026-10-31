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
  tooling: {
    files: {
      append: ["src/prettier/index.ts"],
    },
  },
});
