import {
  defaultSuppressionsFile,
  eslint,
  rolePresetsEntry,
} from "#tools/eslint/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/eslint",
  when: {
    installed: eslint,
  },
  owns: {
    files: {
      "eslint-suppressions.json": {
        title: "ESLint",
        formatted: false,
        async locate(): Promise<FileLocation> {
          return { file: defaultSuppressionsFile };
        },
      },
    },
  },
  contributes: {
    "roles": [
      {
        name: "extension",
        from: rolePresetsEntry,
        environments: [],
      },
    ],
    "gate.steps": [
      {
        name: eslint,
        stage: "fixes",
        audience: "agents",
        async load() {
          const { fixWithEslint } =
            await import("#tools/eslint/operations/fixWithEslint");

          return fixWithEslint;
        },
      },
    ],
  },
} satisfies Extension;
