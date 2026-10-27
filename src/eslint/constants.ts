import { freeze } from "@auaust/toolkit/object";

import * as comparisons from "#eslint/conventions/comparisons/index";
import * as globals from "#eslint/conventions/globals/index";
import * as imports from "#eslint/conventions/imports/index";
import * as performance from "#eslint/conventions/performance/index";
import * as promises from "#eslint/conventions/promises/index";
import * as structure from "#eslint/conventions/structure/index";
import * as stylistic from "#eslint/conventions/stylistic/index";
import { dependencyFields } from "#support/packageJson/constants";
import type { Rules } from "#eslint/types/Rules";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

export const anyFile = "**" satisfies Glob;

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
} as const satisfies Rules);

export const pluginName = "auaust";

export const recommendedRules = freeze({
  "@stylistic/arrow-parens": "error",
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "no-cond-assign": "off",
  "no-useless-return": "error",
} as const satisfies Rules);

export const defaultCacheLocation = "node_modules/.cache/eslint" satisfies File;
