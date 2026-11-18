import {
  conventionEntry,
  defaultSuppressionsFile,
  eslint,
} from "#tools/eslint/constants";
import type { Extension, FileLocation } from "#project/config/index";

// @debt the extension owns no config key, so its options come only from definer arguments
/**
 * Active when `eslint` is installed; owns the `eslint.conventions` slot and the
 * suppressions file, contributes the `apis` role and runs ESLint in the gate.
 */
export default {
  name: "tools/eslint",
  when: {
    installed: eslint,
  },
  owns: {
    slots: {
      "eslint.conventions": {
        entry: conventionEntry,
      },
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
        async load() {
          const { apis } = await import("#tools/eslint/roles/index");

          return apis;
        },
        environments: ["src", "tests", "scripts", "tooling"],
      },
    ],
    "gate.steps": [
      {
        name: eslint,
        stage: "fixes",
        audience: "agents",
        load() {
          return import("#tools/eslint/operations/fixWithEslint");
        },
      },
    ],
  },
} satisfies Extension;
