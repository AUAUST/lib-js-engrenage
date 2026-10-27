import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";

import { importRules } from "#eslint/constants";
import type { Config } from "#eslint/types/Config";
import type { Globs } from "#types/Globs";

export function createImportPresets({
  codeFiles,
}: {
  codeFiles: Globs;
}): Config[] {
  return defineConfig([
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    {
      files: [...codeFiles],
      settings: {
        "import-x/resolver-next": [createTypeScriptImportResolver()],
      },
      rules: importRules,
    },
  ]);
}
