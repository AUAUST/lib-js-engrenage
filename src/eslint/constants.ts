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
import type { CoreRules } from "#eslint/types/rules/CoreRules";
import type { ImportXRules } from "#eslint/types/rules/ImportXRules";
import type { StylisticRules } from "#eslint/types/rules/StylisticRules";
import type { TypescriptEslintRules } from "#eslint/types/rules/TypescriptEslintRules";
import type { UnicornRules } from "#eslint/types/rules/UnicornRules";
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

export const coreRules = freeze({
  "array-callback-return": "error",
  "default-case-last": "error",
  "no-cond-assign": "off",
  "no-extend-native": "error",
  "no-promise-executor-return": "error",
  "no-self-compare": "error",
  "no-unmodified-loop-condition": "error",
  "no-unreachable-loop": "error",
  "no-useless-rename": "error",
  "no-useless-return": "error",
  "prefer-object-has-own": "error",
  "radix": "error",
} as const satisfies CoreRules);

export const typescriptRules = freeze({
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-unused-vars": "off",
} as const satisfies TypescriptEslintRules);

export const typescriptTypeAwareRules = freeze({
  "@typescript-eslint/await-thenable": "error",
  "@typescript-eslint/no-duplicate-type-constituents": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-mixed-enums": "error",
  "@typescript-eslint/no-redundant-type-constituents": "error",
  "@typescript-eslint/no-unnecessary-type-arguments": "error",
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/no-unnecessary-type-conversion": "error",
  "@typescript-eslint/no-unnecessary-type-parameters": "error",
  "@typescript-eslint/only-throw-error": "error",
  "@typescript-eslint/prefer-find": "error",
  "@typescript-eslint/prefer-includes": "error",
  "@typescript-eslint/prefer-string-starts-ends-with": "error",
  "@typescript-eslint/restrict-template-expressions": "error",
} as const satisfies TypescriptEslintRules);

export const importRules = freeze({
  "import-x/no-empty-named-blocks": "error",
  "import-x/no-extraneous-dependencies": "error",
  "import-x/no-mutable-exports": "error",
  "import-x/no-self-import": "error",
  "import-x/no-unresolved": "off",
  "import-x/no-useless-path-segments": "error",
} as const satisfies ImportXRules);

export const stylisticRules = freeze({
  "@stylistic/arrow-parens": "error",
} as const satisfies StylisticRules);

export const unicornRules = freeze({
  "unicorn/better-dom-traversing": "warn",
} as const satisfies UnicornRules);

export const defaultCacheLocation = "node_modules/.cache/eslint" satisfies File;
