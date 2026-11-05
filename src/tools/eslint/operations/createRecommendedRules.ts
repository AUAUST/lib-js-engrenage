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
} from "#tools/eslint/constants";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { createTypeAwareLanguageOptions } from "#tools/eslint/utils/createTypeAwareLanguageOptions";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import type { ProjectConfig } from "#project/config/index";
import type { Config } from "#tools/eslint/types/Config";

export function createRecommendedRules({
  config,
  typeAware,
}: {
  config: ProjectConfig;
  typeAware: boolean;
}): Config[] {
  return defineConfig([
    {
      files: resolveScope(config, ["files.code"]),
      extends: [
        js.configs.recommended,
        typescriptConfigs.recommended,
        typescriptConfigs.stylistic,
      ],
    },
    resolveInfoRules({
      name: `${pluginName}/recommended`,
      files: resolveScope(config, ["files.code"]),
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
