import { configs as packageJsonConfigs } from "eslint-plugin-package-json";

import { packageJsonFile } from "#constants";
import {
  dependencyFields,
  packageJsonPropertyOrder,
} from "#project/package/constants";
import { pluginName } from "#tools/eslint/constants";
import type { Config } from "#tools/eslint/types/Config";

export function createPackageJsonRules(): Config {
  return {
    name: `${pluginName}/package-json`,
    files: [`**/${packageJsonFile}`],
    languageOptions: packageJsonConfigs.recommended.languageOptions,
    rules: {
      ...packageJsonConfigs.recommended.rules,
      "package-json/sort-collections": [
        "error",
        [
          "bin",
          "config",
          "files",
          "imports",
          "overrides",
          "scripts",
          ...dependencyFields,
          "inlinedDependencies",
          "peerDependenciesMeta",
        ],
      ],
      "package-json/order-properties": [
        "error",
        {
          order: [...packageJsonPropertyOrder],
        },
      ],
    },
  };
}
