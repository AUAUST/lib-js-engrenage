import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import {
  coreRules,
  pluginName,
  stylisticRules,
  testRules,
  typescriptRules,
  typescriptTypeAwareRules,
  unicornRules,
} from "#eslint/constants";
import { createTypeAwareLanguageOptions } from "#eslint/utils/createTypeAwareLanguageOptions";
import { resolveInfoRules } from "#eslint/utils/resolveInfoRules";
import { resolveScope } from "#eslint/utils/resolveScope";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#eslint/types/Config";

export function createRecommendedRules({
  config,
  typeAware,
}: {
  config: ResolvedConfig;
  typeAware: boolean;
}): Config[] {
  return defineConfig([
    js.configs.recommended,
    typescriptConfigs.recommended,
    typescriptConfigs.stylistic,
    resolveInfoRules({
      name: `${pluginName}/recommended`,
      files: [...config.typescript.files],
      rules: {
        ...coreRules,
        ...typescriptRules,
        ...stylisticRules,
        ...unicornRules,
      },
    }),
    {
      name: `${pluginName}/recommended/tests`,
      files: resolveScope(config, ["files.test"]),
      rules: testRules,
    },
    typeAware
      ? resolveInfoRules({
          name: `${pluginName}/recommended/type-aware`,
          files: resolveScope(config, [
            "files.code.published",
            "files.code.private",
          ]),
          extends: [typescriptConfigs.recommendedTypeCheckedOnly],
          languageOptions: createTypeAwareLanguageOptions(config),
          rules: typescriptTypeAwareRules,
        })
      : [],
  ]);
}
