import { freeze } from "@auaust/toolkit/object";

import * as comparisons from "#eslint/conventions/comparisons/index";
import * as globals from "#eslint/conventions/globals/index";
import * as imports from "#eslint/conventions/imports/index";
import * as performance from "#eslint/conventions/performance/index";
import * as promises from "#eslint/conventions/promises/index";
import * as structure from "#eslint/conventions/structure/index";
import * as stylistic from "#eslint/conventions/stylistic/index";
import type { Rules } from "#eslint/types/Rules";
import type { File } from "#types/File";

export const conventionCategories = freeze({
  globals,
  comparisons,
  stylistic,
  imports,
  promises,
  structure,
  performance,
} as const);

export const packageJsonRules = freeze({
  "package-json/order-properties": "error",
  "package-json/sort-collections": [
    "error",
    [
      "bin",
      "config",
      "files",
      "imports",
      "overrides",
      "scripts",
      "dependencies",
      "devDependencies",
      "inlineDependencies",
      "optionalDependencies",
      "peerDependencies",
      "peerDependenciesMeta",
    ],
  ],
} as const satisfies Rules);

export const pluginName = "auaust";

export const recommendedRules = freeze({
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "no-cond-assign": "off",
} as const satisfies Rules);

export const defaultCacheLocation = "node_modules/.cache/eslint" satisfies File;
