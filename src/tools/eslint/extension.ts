import {
  conventionEntry,
  defaultSuppressionsFile,
  eslint,
} from "#tools/eslint/constants";
import type { Extension, FileLocation } from "#project/config/index";

// @debt the extension owns no config key, so its options come only from definer arguments
/**
 * Active when `eslint` is installed; owns the `eslint.conventions` slot and the
 * suppressions file, contributes the `apis` role, runs ESLint in the gate and
 * refuses new suppressions from agents.
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
        async load() {
          const {
            fixWithEslint,
          } = await import("#tools/eslint/operations/fixWithEslint");

          return fixWithEslint;
        },
        check: {
          async load() {
            const {
              checkWithEslint,
            } = await import("#tools/eslint/operations/checkWithEslint");

            return checkWithEslint;
          },
        },
      },
      {
        name: "eslint suppressions",
        stage: "checks",
        audience: "agents",
        async load() {
          const {
            checkSuppressions,
          } = await import("#tools/eslint/operations/checkSuppressions");

          return checkSuppressions;
        },
      },
    ],
  },
} satisfies Extension;
