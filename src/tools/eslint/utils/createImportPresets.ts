import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";

import { typescriptFiles } from "#tools/eslint/constants";
import type { Config } from "#tools/eslint/types/Config";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export function createImportPresets({
  codeFiles,
  tsconfig,
}: {
  codeFiles: Globs;
  tsconfig: File | undefined;
}): Config[] {
  return defineConfig([
    {
      files: [...codeFiles],
      extends: [
        importX.flatConfigs.recommended,
        importX.flatConfigs.typescript,
      ],
    },
    {
      files: [...codeFiles],
      settings: {
        "import-x/resolver-next": [
          createTypeScriptImportResolver(
            tsconfig === undefined
              ? {}
              : {
                  project: tsconfig,
                },
          ),
        ],
      },
      rules: {
        "import-x/namespace": ["error", { allowComputed: true }],
        "import-x/no-empty-named-blocks": "error",
        "import-x/no-extraneous-dependencies": "error",
        "import-x/no-mutable-exports": "error",
        "import-x/no-named-as-default": "error",
        "import-x/no-unresolved": "off",
      },
    },
    {
      files: codeFiles.map((glob) => {
        return [glob, typescriptFiles];
      }),
      rules: {
        "import-x/namespace": "off",
      },
    },
  ]);
}
