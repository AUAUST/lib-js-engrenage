import { importRules } from "#config/eslint/importRules";
import { toolConfigFiles } from "#config/eslint/toolConfigFiles";
import { typescriptFiles } from "#config/eslint/typescriptFiles";
import type { Config } from "#eslint/types/Config";
import type { Glob } from "#types/Glob";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";

export function createImportRules({
  defaultExportFiles = [],
}: {
  defaultExportFiles?: Glob[];
}): Config[] {
  return defineConfig([
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    {
      files: [typescriptFiles],
      settings: {
        "import-x/resolver-next": [createTypeScriptImportResolver()],
      },
      rules: importRules,
    },
    {
      files: [...toolConfigFiles, ...defaultExportFiles],
      rules: {
        "import-x/no-default-export": "off",
      },
    },
  ]);
}
