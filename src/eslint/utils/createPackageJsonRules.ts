import { configs as packageJsonConfigs } from "eslint-plugin-package-json";
import { sortOrder } from "sort-package-json";

import { flat, flatMap, includes } from "@auaust/primitive-kit/arrays";
import { entries, keys, values } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import {
  packageJsonPlacements,
  packageJsonRules,
  pluginName,
} from "#eslint/constants";
import type { Config } from "#eslint/types/Config";

function createPropertyOrder(): string[] {
  for (const anchor of keys(packageJsonPlacements)) {
    if (!includes(sortOrder, anchor)) {
      throw new Error(
        `sort-package-json no longer orders '${anchor}', which package.json placements follow`,
      );
    }
  }

  const placements = new Map<string, ReadonlyArray<string>>(
    entries(packageJsonPlacements),
  );

  const placed = flat(values(packageJsonPlacements));

  return flatMap(sortOrder, (property) => {
    if (includes(placed, property)) {
      return [];
    }

    return [property, ...(placements.get(property) ?? [])];
  });
}

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
          order: createPropertyOrder(),
        },
      ],
    },
  };
}
