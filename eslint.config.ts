import { globalIgnores } from "eslint/config";
import { defineEslintConfig } from "#eslint/index";

export default defineEslintConfig({}, globalIgnores(["tests/fixtures/**"]), {
  files: [
    "src/**/config/schemas/**/*.ts",
    "src/**/config/defaults/**/*.ts",
    "src/**/constants/**/*.ts",
    "src/**/conventions/**/*.ts",
  ],
  rules: {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex:
              "^(?!valibot$|node:|#[^/]+/(config/(schemas|defaults)|constants|conventions)/)",
            allowTypeImports: true,
            message:
              "Schemas, defaults, constants and conventions stay pure: import valibot, types or other schemas, defaults, constants and conventions.",
          },
          {
            regex: "^node:",
            message:
              "Schemas, defaults, constants and conventions never import node:*.",
          },
        ],
      },
    ],
  },
});
