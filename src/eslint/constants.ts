import { freeze } from "@auaust/toolkit/object";

import { dependencyFields } from "#support/packageJson/constants";
import type { Rules } from "#eslint/types/Rules";
import type { CoreRules } from "#eslint/types/rules/CoreRules";
import type { ImportXRules } from "#eslint/types/rules/ImportXRules";
import type { StylisticRules } from "#eslint/types/rules/StylisticRules";
import type { TypescriptEslintRules } from "#eslint/types/rules/TypescriptEslintRules";
import type { UnicornRules } from "#eslint/types/rules/UnicornRules";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

import * as comparisons from "#eslint/conventions/comparisons/index";
import * as globals from "#eslint/conventions/globals/index";
import * as imports from "#eslint/conventions/imports/index";
import * as performance from "#eslint/conventions/performance/index";
import * as promises from "#eslint/conventions/promises/index";
import * as structure from "#eslint/conventions/structure/index";
import * as stylistic from "#eslint/conventions/stylistic/index";

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

export const infoRulesSetting = `${pluginName}/info-rules`;

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
  "import-x/no-named-as-default": "error",
  "import-x/no-self-import": "error",
  "import-x/no-unresolved": "off",
  "import-x/no-useless-path-segments": "error",
} as const satisfies ImportXRules);

export const stylisticRules = freeze({
  "@stylistic/arrow-parens": "error",
} as const satisfies StylisticRules);

export const unicornRules = freeze({
  "unicorn/better-dom-traversing": "info",
  "unicorn/new-for-builtins": "error",
  "unicorn/no-accessor-recursion": "error",
  "unicorn/no-array-fill-with-reference-type": "error",
  "unicorn/no-async-iterator-callback": "error",
  "unicorn/no-async-promise-finally": "error",
  "unicorn/no-await-expression-member": "error",
  "unicorn/no-await-in-promise-methods": "error",
  "unicorn/no-boolean-sort-comparator": "error",
  "unicorn/no-chained-comparison": "error",
  "unicorn/no-collection-bracket-access": "error",
  "unicorn/no-confusing-array-splice": "error",
  "unicorn/no-console-spaces": "info",
  "unicorn/no-constant-zero-expression": "error",
  "unicorn/no-declarations-before-early-exit": "error",
  "unicorn/no-double-comparison": "error",
  "unicorn/no-duplicate-if-branches": "error",
  "unicorn/no-duplicate-logical-operands": "error",
  "unicorn/no-duplicate-set-values": "error",
  "unicorn/no-error-property-assignment": "error",
  "unicorn/no-for-each": "error",
  "unicorn/no-for-loop": "error",
  "unicorn/no-impossible-length-comparison": "error",
  "unicorn/no-incomplete-accessor-override": "error",
  "unicorn/no-incorrect-query-selector": "info",
  "unicorn/no-incorrect-template-string-interpolation": "error",
  "unicorn/no-invalid-character-comparison": "error",
  "unicorn/no-invalid-dom-token": "info",
  "unicorn/no-invalid-fetch-options": "error",
  "unicorn/no-invalid-intl-options": "error",
  "unicorn/no-invalid-property-descriptor": "error",
  "unicorn/no-invalid-remove-event-listener": "info",
  "unicorn/no-invalid-response-options": "error",
  "unicorn/no-invalid-url-protocol-comparison": "error",
  "unicorn/no-invalid-well-known-symbol-methods": "error",
  "unicorn/no-late-current-target-access": "info",
  "unicorn/no-late-event-control": "info",
  "unicorn/no-lonely-if": "error",
  "unicorn/no-loop-iterable-mutation": "error",
  "unicorn/no-mismatched-map-key": "error",
  "unicorn/no-misrefactored-assignment": "error",
  "unicorn/no-multiple-promise-resolver-calls": "error",
  "unicorn/no-negation-in-equality-check": "error",
  "unicorn/no-new-array": "error",
  "unicorn/no-new-buffer": "error",
  "unicorn/no-object-as-default-parameter": "error",
  "unicorn/no-object-methods-with-collections": "error",
  "unicorn/no-optional-chaining-on-undeclared-variable": "error",
  "unicorn/no-prevent-default-in-passive-listener": "info",
  "unicorn/no-redundant-comparison": "error",
  "unicorn/no-return-array-push": "error",
  "unicorn/no-single-promise-in-promise-methods": "error",
  "unicorn/no-thenable": "error",
  "unicorn/no-unnecessary-array-flat-depth": "error",
  "unicorn/no-unnecessary-array-flat-map": "error",
  "unicorn/no-unnecessary-array-splice-count": "error",
  "unicorn/no-unnecessary-boolean-comparison": "error",
  "unicorn/no-unnecessary-fetch-options": "error",
  "unicorn/no-unnecessary-global-this": "error",
  "unicorn/no-unnecessary-slice-end": "error",
  "unicorn/no-unnecessary-splice": "error",
  "unicorn/no-unnecessary-string-trim": "error",
  "unicorn/no-unsafe-promise-all-settled-values": "error",
  "unicorn/no-unsafe-string-replacement": "error",
  "unicorn/no-unused-builtin-method-return": "error",
  "unicorn/no-unused-iterator-helper": "error",
  "unicorn/no-url-in-search-params": "error",
  "unicorn/no-useless-boolean-cast": "error",
  "unicorn/no-useless-coercion": "error",
  "unicorn/no-useless-collection-argument": "error",
  "unicorn/no-useless-compound-assignment": "error",
  "unicorn/no-useless-concat": "error",
  "unicorn/no-useless-continue": "error",
  "unicorn/no-useless-delete-check": "error",
  "unicorn/no-useless-error-capture-stack-trace": "error",
  "unicorn/no-useless-fallback-in-spread": "error",
  "unicorn/no-useless-length-check": "error",
  "unicorn/no-useless-logical-operand": "error",
  "unicorn/no-useless-override": "error",
  "unicorn/no-useless-promise-resolve-reject": "error",
  "unicorn/no-useless-re-export": "error",
  "unicorn/no-useless-set-construction": "error",
  "unicorn/no-useless-spread": "error",
  "unicorn/no-useless-switch-case": "error",
  "unicorn/no-useless-template-literals": "error",
  "unicorn/no-using-resource-escape": "error",
  "unicorn/no-xor-as-exponentiation": "error",
  "unicorn/no-zero-fractions": "error",
  "unicorn/prefer-add-event-listener": "info",
  "unicorn/prefer-array-some": "error",
  "unicorn/prefer-boolean-return": "error",
  "unicorn/prefer-classlist-toggle": "info",
  "unicorn/prefer-combined-guards": "error",
  "unicorn/prefer-continue": "error",
  "unicorn/prefer-default-parameters": "error",
  "unicorn/prefer-dom-node-append": "info",
  "unicorn/prefer-dom-node-remove": "info",
  "unicorn/prefer-dom-node-text-content": "info",
  "unicorn/prefer-early-return": "error",
  "unicorn/prefer-export-from": "error",
  "unicorn/prefer-global-this": "error",
  "unicorn/prefer-hoisting-branch-code": "error",
  "unicorn/prefer-identifier-import-export-specifiers": "error",
  "unicorn/prefer-iterable-in-constructor": "error",
  "unicorn/prefer-keyboard-event-key": "info",
  "unicorn/prefer-logical-operator-over-ternary": "error",
  "unicorn/prefer-modern-dom-apis": "info",
  "unicorn/prefer-optional-catch-binding": "error",
  "unicorn/prefer-promise-static-methods": "error",
  "unicorn/prefer-query-selector": "info",
  "unicorn/prefer-regexp-test": "error",
  "unicorn/prefer-set-has": "error",
  "unicorn/prefer-set-size": "error",
  "unicorn/prefer-simplified-conditions": "info",
  "unicorn/prefer-single-call": "error",
  "unicorn/prefer-string-raw": "error",
  "unicorn/prefer-string-replace-all": "error",
  "unicorn/prefer-string-slice": "error",
  "unicorn/prefer-structured-clone": "error",
  "unicorn/prefer-toggle-attribute": "info",
  "unicorn/prefer-top-level-await": "error",
  "unicorn/prefer-type-error": "error",
  "unicorn/prefer-url-can-parse": "error",
  "unicorn/require-css-escape": "info",
  "unicorn/require-module-attributes": "error",
  "unicorn/require-number-to-fixed-digits-argument": "error",
  "unicorn/require-proxy-trap-boolean-return": "error",
  "unicorn/text-encoding-identifier-case": "error",
  "unicorn/throw-new-error": "error",
} as const satisfies UnicornRules);

export const defaultCacheLocation = "node_modules/.cache/eslint" satisfies File;

export const defaultSuppressionsFile =
  "eslint-suppressions.json" satisfies File;
