import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import { stylisticRules } from "#eslint/config/defaults/stylisticRules";
import type { Config } from "#eslint/types/Config";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import { getDefault } from "valibot";

export function createStylisticRules(): Config[] {
  return defineConfig([
    {
      files: [getDefault(codeFilesSchema)],
      plugins: {
        "@stylistic": stylistic,
      },
      rules: stylisticRules,
    },
  ]);
}
