import { configs as packageJsonConfigs } from "eslint-plugin-package-json";

import { packageJsonFile } from "#constants";
import {
  packageJsonPropertyOrder,
  packageJsonRules,
  pluginName,
} from "#eslint/constants";
import type { Config } from "#eslint/types/Config";

export function createPackageJsonRules(): Config {
  return {
    name: `${pluginName}/package-json`,
    files: [`**/${packageJsonFile}`],
    languageOptions: packageJsonConfigs.recommended.languageOptions,
    rules: {
      ...packageJsonRules,
      "package-json/order-properties": [
        "error",
        {
          order: [...packageJsonPropertyOrder],
        },
      ],
    },
  };
}
