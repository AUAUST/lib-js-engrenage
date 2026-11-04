import { defineConfig } from "#config";

export default defineConfig({
  presets: ["library"],
  aliases: {
    define: { "#package.json": "./package.json" },
  },
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
      "foundation": { prefix: "" },
      "project": { prefix: "" },
      "tools": { prefix: "" },
      "workflows": { prefix: "" },
    },
    domains: {
      "tools/*": { public: true },
      "tools/agents/claude": { public: true },
      "tools/agents/codex": { public: true },
      "project/config": { public: true },
      "project/package": { public: true },
      "project/baseline": { public: true },
    },
    exports: {
      ".": "src/index.ts",
      "./constants": "src/constants.ts",
      "./agents": "src/tools/agents/index.ts",
      "./agents/constants": "src/tools/agents/constants.ts",
      "./agents/claude": "src/tools/agents/claude/index.ts",
      "./agents/claude/constants": "src/tools/agents/claude/constants.ts",
      "./agents/codex": "src/tools/agents/codex/index.ts",
      "./agents/codex/constants": "src/tools/agents/codex/constants.ts",
      "./changesets": "src/tools/changesets/index.ts",
      "./changesets/constants": "src/tools/changesets/constants.ts",
      "./config": "src/project/config/index.ts",
      "./config/constants": "src/project/config/constants.ts",
      "./eslint": "src/tools/eslint/index.ts",
      "./eslint/constants": "src/tools/eslint/constants.ts",
      "./git": "src/tools/git/index.ts",
      "./git/constants": "src/tools/git/constants.ts",
      "./github": "src/tools/github/index.ts",
      "./github/constants": "src/tools/github/constants.ts",
      "./pnpm": "src/tools/pnpm/index.ts",
      "./pnpm/constants": "src/tools/pnpm/constants.ts",
      "./prettier": "src/tools/prettier/index.ts",
      "./prettier/constants": "src/tools/prettier/constants.ts",
      "./tsdown": "src/tools/tsdown/index.ts",
      "./tsdown/constants": "src/tools/tsdown/constants.ts",
      "./typescript": "src/tools/typescript/index.ts",
      "./typescript/constants": "src/tools/typescript/constants.ts",
      "./vite": "src/tools/vite/index.ts",
      "./vitest": "src/tools/vitest/index.ts",
      "./vitest/constants": "src/tools/vitest/constants.ts",
      "./vscode": "src/tools/vscode/index.ts",
      "./vscode/constants": "src/tools/vscode/constants.ts",
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
  tooling: {
    files: {
      append: ["src/tools/prettier/index.ts"],
    },
  },
});
