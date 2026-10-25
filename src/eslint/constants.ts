import { freeze } from "@auaust/toolkit/object";

import * as globals from "#eslint/conventions/globals/index";
import * as imports from "#eslint/conventions/imports/index";
import * as promises from "#eslint/conventions/promises/index";
import * as structure from "#eslint/conventions/structure/index";
import * as stylistic from "#eslint/conventions/stylistic/index";
import * as typeChecks from "#eslint/conventions/typeChecks/index";
import type { Rules } from "#eslint/types/Rules";

export const conventionCategories = freeze({
  globals,
  typeChecks,
  stylistic,
  imports,
  promises,
  structure,
});

export const pluginName = "auaust";

export const recommendedRules: Rules = freeze({
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "no-cond-assign": "off",
});
