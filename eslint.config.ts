import { defineConfig } from "eslint/config";
import { createEslintConfig } from "#eslint/index";

export default defineConfig([
  createEslintConfig({
    root: new URL("./", import.meta.url),
    sourceDirectories: ["src", "bin", "config"],
    defaultExportFiles: ["src/prettier/index.ts", "bin/**/*.ts"],
    ignores: ["tests/fixtures/**"],
  }),
  {
    files: ["config/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: ".*",
              allowTypeImports: true,
              message: "config/ holds data only: import types, never values.",
            },
          ],
        },
      ],
    },
  },
]);
