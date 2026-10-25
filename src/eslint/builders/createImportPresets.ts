import type { Config } from "#eslint/types/Config";
import type { Glob } from "#types/Glob";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";

export function createImportPresets({
  codeFiles,
}: {
  codeFiles: Glob;
}): Config[] {
  return defineConfig([
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    {
      files: [codeFiles],
      settings: {
        "import-x/resolver-next": [createTypeScriptImportResolver()],
      },
      rules: {
        "import-x/no-unresolved": "off",
      },
    },
  ]);
}
