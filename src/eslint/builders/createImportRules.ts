import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import { configFilesSchema } from "#config/config/schemas/configFilesSchema";
import { importRules } from "#eslint/config/defaults/importRules";
import type { Config } from "#eslint/types/Config";
import type { Glob } from "#types/Glob";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";
import { getDefault } from "valibot";

export function createImportRules({
  defaultExportFiles = [],
}: {
  defaultExportFiles?: Glob[];
}): Config[] {
  return defineConfig([
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    {
      files: [getDefault(codeFilesSchema)],
      settings: {
        "import-x/resolver-next": [createTypeScriptImportResolver()],
      },
      rules: importRules,
    },
    {
      files: [...getDefault(configFilesSchema), ...defaultExportFiles],
      rules: {
        "import-x/no-default-export": "off",
      },
    },
  ]);
}
