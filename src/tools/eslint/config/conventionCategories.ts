import { freeze } from "@auaust/toolkit/object";

import * as comparisons from "#tools/eslint/conventions/comparisons/index";
import * as globals from "#tools/eslint/conventions/globals/index";
import * as imports from "#tools/eslint/conventions/imports/index";
import * as performance from "#tools/eslint/conventions/performance/index";
import * as promises from "#tools/eslint/conventions/promises/index";
import * as structure from "#tools/eslint/conventions/structure/index";
import * as stylistic from "#tools/eslint/conventions/stylistic/index";

// @debt no location fits this value; it's not a constant, not a helper. new role required?
export const conventionCategories = freeze({
  globals,
  comparisons,
  stylistic,
  imports,
  promises,
  structure,
  performance,
} as const);
