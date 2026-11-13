import {
  conventionEntry,
  defaultSuppressionsFile,
  eslint,
  rolePresetsEntry,
} from "#tools/eslint/constants";
import type { Extension, FileLocation } from "#project/config/index";

// @debt the extension owns no config key, so its options come only from definer arguments
export default {
  name: "tools/eslint",
  when: {
    installed: eslint,
  },
  owns: {
    slots: {
      "eslint.conventions": { entry: conventionEntry },
    },
    files: {
      "eslint-suppressions.json": {
        title: "ESLint",
        formatted: false,
        locate(): FileLocation {
          return { file: defaultSuppressionsFile };
        },
      },
    },
  },
  contributes: {
    "roles": [
      {
        name: "apis",
        from: rolePresetsEntry,
        environments: ["src", "tests", "scripts", "tooling"],
      },
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
          const {
            fixWithEslint,
          } = await import("#tools/eslint/operations/fixWithEslint");

          return fixWithEslint;
        },
      },
    ],
  },
} satisfies Extension;
