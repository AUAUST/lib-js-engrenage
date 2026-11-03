import { defineConfig } from "#config/index";

export default defineConfig({
  presets: ["library"],
  roles: {
    define: {
      config: { exports: "named-match", roles: ["schemas"] },
      schemas: { exports: "named-match", scoped: true },
      setup: { exports: "named-match" },
      plugins: { exports: "named-match" },
      operations: { exports: "named-match" },
    },
  },
  agents: {
    preferred: ["claude", "codex"],
    attribution: false,
  },
  tests: {
    dist: {
      tsconfig: {
        compilerOptions: {
          exactOptionalPropertyTypes: false,
        },
      },
    },
  },
  typescript: {
    tsconfig: {
      extends: ["./data/tsconfig/library.json"],
    },
  },
  src: {
    node: 24,
    exports: {
      "./agents/*/constants": "src/agents/*/constants.ts",
      "./agents/*": "src/agents/*/index.ts",
      "./*/constants": "src/*/constants.ts",
      "./*": "src/*/index.ts",
      "./constants": "src/constants.ts",
      ".": "src/index.ts",
    },
    generated: ["eslint/types/Rules.ts", "eslint/types/rules/**"],
    discovered: ["eslint/conventions/*/*.ts"],
  },
  data: {
    exports: {
      "./apis/*": "data/apis/*.d.ts",
      "./agents/templates/*.md": "data/agents/templates/*.md",
      "./agents/rules/*.md": "data/agents/rules/*.md",
      "./agents/sections/*.md": "data/agents/sections/*.md",
      "./agents/skills/*.md": "data/agents/skills/*.md",
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
