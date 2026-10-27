import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { recommendedRules } from "#eslint/constants";
import type { Config } from "#eslint/types/Config";
import type { Globs } from "#types/Globs";

export function createRecommendedRules({
  codeFiles,
}: {
  codeFiles: Globs;
}): Config[] {
  return defineConfig([
    js.configs.recommended,
    typescriptConfigs.recommended,
    {
      files: [...codeFiles],
      rules: recommendedRules,
    },
  ]);
}
