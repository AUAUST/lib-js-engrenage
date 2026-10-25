import { defineConfig } from "eslint/config";
import { createEslintConfig } from "#eslint/index";

export default defineConfig([
  createEslintConfig({
    root: new URL("./", import.meta.url),
    sourceDirectories: ["src", "bin"],
    defaultExportFiles: ["src/prettier/index.ts", "bin/**/*.ts"],
    ignores: ["tests/fixtures/**"],
  }),
  {
    files: [
      "src/**/config/schemas/**/*.ts",
      "src/**/config/defaults/**/*.ts",
      "src/**/constants/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(?!valibot$|node:|#[^/]+/(config/(schemas|defaults)|constants)/)",
              allowTypeImports: true,
              message:
                "Schemas, defaults and constants stay pure: import valibot, types or other schemas, defaults and constants.",
            },
            {
              regex: "^node:",
              message: "Schemas, defaults and constants never import node:*.",
            },
          ],
        },
      ],
    },
  },
]);
