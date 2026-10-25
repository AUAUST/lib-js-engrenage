import { stylisticRules } from "#config/eslint/stylisticRules";
import { typescriptFiles } from "#config/eslint/typescriptFiles";
import type { Config } from "#eslint/types/Config";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

export function createStylisticRules(): Config[] {
  return defineConfig([
    {
      files: [typescriptFiles],
      plugins: {
        "@stylistic": stylistic,
      },
      rules: stylisticRules,
    },
  ]);
}
