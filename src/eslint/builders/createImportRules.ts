import { toolConfigFiles } from "#eslint/presets/toolConfigFiles";
import { typescriptFiles } from "#eslint/presets/typescriptFiles";
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
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            fixStyle: "inline-type-imports",
          },
        ],
        "@typescript-eslint/no-import-type-side-effects": "error",
        "import-x/no-duplicates": [
          "error",
          {
            "prefer-inline": true,
          },
        ],
        "import-x/no-default-export": "error",
        "import-x/no-unresolved": "off",
      },
    },
    {
      files: [...toolConfigFiles, ...defaultExportFiles],
      rules: {
        "import-x/no-default-export": "off",
      },
    },
  ]);
}
