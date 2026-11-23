import {
  boolean,
  custom,
  objectWithRest,
  optional,
  record,
  string,
  union,
} from "valibot";

import { isBoolean, isFunction, isPlainObject } from "@auaust/toolkit";
import { every } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import type { RoleRuleLoader } from "#tools/eslint/types/RoleRuleLoader";

import type * as conventionCategories from "#tools/eslint/conventions/index";

function isConventionSettings(input: unknown): boolean {
  return isPlainObject(input) && every(values(input), isBoolean);
}

// @debt the schema checks only the shape of a category's settings, since the conventions it would list are effectful; `selectConventions` rejects unknown convention names instead, so the published schema accepts them
function categorySchema<Category extends object>() {
  return optional(
    union([
      boolean(),
      custom<Partial<Record<keyof Category & string, boolean>>>(
        isConventionSettings,
        "Expected a boolean or a record of convention names to booleans",
      ),
    ]),
    true,
  );
}

/**
 * Validates `defineEslintConfig`'s options: built-in rule groups default
 * to enabled, and each convention category takes a boolean or a record of
 * convention names to booleans, unknown names being rejected later when
 * conventions are selected. `roleRules` maps role names to rule keys to the
 * loaders of their role rules.
 */
export const optionsSchema = objectWithRest(
  {
    ignore: optional(boolean(), true),
    recommended: optional(boolean(), true),
    packageJson: optional(boolean(), true),
    typeAware: optional(boolean(), true),
    roleRules: optional(
      record(
        string(),
        record(
          string(),
          custom<RoleRuleLoader>(
            isFunction,
            "Expected a function loading a `defineRoleRule` rule",
          ),
        ),
      ),
      {},
    ),
    comparisons: categorySchema<typeof conventionCategories.comparisons>(),
    stylistic: categorySchema<typeof conventionCategories.stylistic>(),
    imports: categorySchema<typeof conventionCategories.imports>(),
    promises: categorySchema<typeof conventionCategories.promises>(),
    structure: categorySchema<typeof conventionCategories.structure>(),
    performance: categorySchema<typeof conventionCategories.performance>(),
    docs: categorySchema<typeof conventionCategories.docs>(),
  },
  categorySchema<Record<string, unknown>>(),
);
