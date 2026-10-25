import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import { recommendedRules } from "#eslint/constants";
import type { Config } from "#eslint/types/Config";
import type { Glob } from "#types/Glob";

export function createRecommendedRules({
  codeFiles,
}: {
  codeFiles: Glob;
}): Config[] {
  return defineConfig([
    js.configs.recommended,
    typescriptConfigs.recommended,
    {
      files: [codeFiles],
      rules: recommendedRules,
    },
  ]);
}
