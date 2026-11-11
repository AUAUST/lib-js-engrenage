import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

import {
  coreRules,
  pluginName,
  testRules,
  typescriptRules,
  typescriptTypeAwareRules,
  unicornRules,
} from "#tools/eslint/constants";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { createTypeAwareLanguageOptions } from "#tools/eslint/utils/createTypeAwareLanguageOptions";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import type { Config } from "#tools/eslint/types/Config";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";
import type { Directory } from "#types/Directory";

export function createRecommendedRules({
  root,
  scopes,
  typeAware,
}: {
  root: Directory;
  scopes: ScopeSources;
  typeAware: boolean;
}): Config[] {
  return defineConfig([
    {
      files: resolveScope(scopes, ["files.code"]),
      extends: [
        js.configs.recommended,
        typescriptConfigs.recommended,
        typescriptConfigs.stylistic,
      ],
    },
    resolveInfoRules({
      name: `${pluginName}/recommended`,
      files: resolveScope(scopes, ["files.code"]),
      rules: {
        ...coreRules,
        ...typescriptRules,
        // @debt this option-bearing rule stays out of `typescriptRules` because `Rule` types options as mutable tuples, which the constants role rejects
        "@typescript-eslint/no-namespace": [
          "error",
          { allowDeclarations: true },
        ],
        ...unicornRules,
      },
    }),
    {
      name: `${pluginName}/recommended/tests`,
      files: resolveScope(scopes, ["files.test"]),
      rules: testRules,
    },
    typeAware
      ? resolveInfoRules({
          name: `${pluginName}/recommended/type-aware`,
          files: resolveScope(scopes, [
            "files.code.published",
            "files.code.private",
          ]),
          extends: [typescriptConfigs.recommendedTypeCheckedOnly],
          languageOptions: createTypeAwareLanguageOptions(root),
          rules: typescriptTypeAwareRules,
        })
      : [],
  ]);
}
