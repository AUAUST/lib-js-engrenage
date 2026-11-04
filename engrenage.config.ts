import { defineConfig } from "#project/config/index";

export default defineConfig({
  preset: "library",
  roles: {
    define: {
      config: { exports: "named-match", roles: ["schemas"] },
      schemas: { exports: "named-match", scoped: true },
      setup: { exports: "named-match" },
      plugins: { exports: "named-match" },
      operations: { exports: "named-match" },
      conventions: {
        categories: true,
        exports: "default",
        discovered: true,
        index: true,
      },
    },
  },
  agents: {
    preferred: ["claude", "codex"],
    attribution: false,
  },
  tests: {
    layout: "mirror",
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
    namespaces: {
      ".": { layers: ["foundation", "project", "tools", "workflows"] },
    },
    domains: {
      "tools/*": { public: true },
      "tools/agents/claude": { public: true },
      "tools/agents/codex": { public: true },
      "project/config": { public: true },
      "project/package": { public: true },
      "project/baseline": { public: true },
      "project/format": { public: true },
    },
    exports: {
      ".": "src/index.ts",
      "./constants": "src/constants.ts",
      "./*/constants": "src/tools/*/constants.ts",
      "./agents/*/constants": "src/tools/agents/*/constants.ts",
      "./config/constants": "src/project/config/constants.ts",
    },
    generated: ["tools/eslint/types/Rules.ts", "tools/eslint/types/rules/**"],
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
});
